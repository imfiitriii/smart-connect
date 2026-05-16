const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const { collection, addDoc, getDocs, Timestamp, doc, updateDoc, arrayUnion } = require("firebase/firestore");
const { db } = require('./firebase');
const llmCall = require('./llm-object');
const llmExtract = require('./llm-extract');
const multer = require('multer');
const pdfParse = require('pdf-parse');

const upload = multer({ storage: multer.memoryStorage() });

const app = express();
const port = process.env.PORT || 3000; //for gcloud deployment

app.use(cors({
    origin: "*"
}));
app.use(express.json());

// --- Health check ---
app.get('/', (req, res) => res.send("hello world"));

// --- POST /extract : convert PDF to text ---
app.post('/extract', upload.single('pdf'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No PDF file uploaded." });
        }
        const data = await pdfParse(req.file.buffer);
        res.json({ text: data.text });
    } catch (err) {
        console.error("❌ /extract error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- POST /llmextract : convert text to JSON profile via Gemini ---
app.post('/llmextract', async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ error: "No text provided." });
        }

        const prompt = `
Role:
You are an Expert Startup Analyst AI working for an innovation ecosystem platform.

Pitch deck text :
${text}

Task:
Analyze the provided pitch deck text convert it into a structured JSON profile that can be used for mentor matching and ecosystem relationship management.
You must extract only relevant information and ignore marketing language or irrelevant content.
---
Output Requirements:
Return ONLY a valid JSON object. Do NOT include explanations, markdown, or extra text.
---
JSON FORMAT (STRICT):
{
  "name": "string (startup name if found, else infer or set 'Unknown')",
  "industry": "string (main industry category)",
  "stage": "string (idea | pre-seed | seed | growth | unknown)",
  "problemStatement": "string (clear 1–2 sentence description of the problem)",
  "solution": "string (what the startup builds)",
  "keyNeeds": ["string", "string"],
  "keywords": ["string", "string", "string"],
  "targetUsers": ["string"],
  "businessModel": "string",
  "aiConfidence": number (0-100 confidence score of extraction accuracy)
}
---
Rules:
- If information is missing, infer logically from context.
- Do NOT hallucinate specific facts like funding numbers or names.
- Keep problemStatement concise and meaningful.
- keywords must be 3–6 high-signal terms.
- keyNeeds must be ecosystem-related (e.g., mentorship, funding, partnerships, technical guidance).
- Output MUST be valid JSON.
        `.trim();

        const rawResult = await llmExtract(process.env.GOOGLE_API_KEY, prompt);
        console.log("🤖 Gemini extraction raw response:", rawResult);

        // Parse Gemini JSON response
        let profile;
        try {
            const cleaned = rawResult.replace(/```json|```/g, '').trim();
            profile = JSON.parse(cleaned);
        } catch (parseErr) {
            return res.status(500).json({
                error: "Failed to parse Gemini response as JSON.",
                raw: rawResult
            });
        }

        res.json(profile);
    } catch (err) {
        console.error("❌ /llmextract error:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- Old test route ---
app.get('/llm', async (req, res) => {
    try {
        const result = await llmCall(process.env.GOOGLE_API_KEY, "Hello");
        res.send("AI response: " + result);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// --- GET /relationships : return all relationship documents ---
app.get('/relationships', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, "relationships"));
        const relationships = [];
        snapshot.forEach(doc => {
            relationships.push({ id: doc.id, ...doc.data() });
        });
        res.json(relationships);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- GET /mentors : return all mentor documents ---
app.get('/mentors', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, "mentors"));
        const mentors = [];
        snapshot.forEach(doc => {
            mentors.push({ id: doc.id, ...doc.data() });
        });
        res.json(mentors);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- GET /startups : return all startup documents ---
app.get('/startups', async (req, res) => {
    try {
        const snapshot = await getDocs(collection(db, "startups"));
        const startups = [];
        snapshot.forEach(doc => {
            startups.push({ id: doc.id, ...doc.data() });
        });
        res.json(startups);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- POST /startups : store startup + run AI matchmaking ---
app.post('/startups', async (req, res) => {
    try {
        const startupData = req.body;

        if (!startupData || Object.keys(startupData).length === 0) {
            return res.status(400).json({ error: "Request body is empty or invalid JSON." });
        }

        // 1. Store the startup in Firestore
        const startupRef = await addDoc(collection(db, "startups"), {
            ...startupData,
            createdAt: Timestamp.now()
        });
        const startupId = startupRef.id;
        console.log(`✅ Startup stored: ${startupId}`);

        // 2. Fetch all mentors from Firestore
        const mentorsSnapshot = await getDocs(collection(db, "mentors"));
        const mentors = [];
        mentorsSnapshot.forEach(doc => {
            mentors.push({ id: doc.id, ...doc.data() });
        });

        if (mentors.length === 0) {
            return res.status(200).json({
                message: "Startup saved, but no mentors found to match against.",
                startupId
            });
        }

        // 3. Build the Gemini prompt
        const prompt = `
Role: You are an Expert Startup-Mentor Matchmaker AI for an innovation ecosystem.

Task: Evaluate a single Startup's profile against a list of available Mentors. 
Calculate a 'matchscore' (0-100) for each mentor based on how well their 'skills', 'Industries', and 'Bio' solve the Startup's 'problemStatement' and 'keyNeeds'.

Input Data:
1. Startup Profile (JSON):
${JSON.stringify(startupData, null, 2)}

2. Available Mentors List (JSON Array):
${JSON.stringify(mentors, null, 2)}

Output Requirements:
Analyze the data and return ONLY a JSON response in the following format for the HIGHEST scoring mentor:
{
  "best_mentor_id": "string",
  "matchscore": int,
  "ai_reasoning": "string explaining why this mentor is the best fit based on the problem statement"
}

Return ONLY the raw JSON with no markdown, no code fences, and no extra text.
        `.trim();

        // 4. Call Gemini
        const rawResult = await llmCall(process.env.GOOGLE_API_KEY, prompt);
        console.log("🤖 Gemini raw response:", rawResult);

        // 5. Parse Gemini JSON response
        let matchResult;
        try {
            // Strip markdown code fences if Gemini wraps the response
            const cleaned = rawResult.replace(/```json|```/g, '').trim();
            matchResult = JSON.parse(cleaned);
        } catch (parseErr) {
            return res.status(500).json({
                error: "Failed to parse Gemini response as JSON.",
                raw: rawResult
            });
        }

        const { best_mentor_id, matchscore, ai_reasoning } = matchResult;

        // 6. Decide relationship status and persist if score >= 60
        let relationshipId = null;
        let status = null;

        if (matchscore >= 85) {
            status = "found";
        } else if (matchscore >= 60) {
            status = "hold";
        }
        // below 60 → no relationship document

        if (status !== null) {
            const relationshipDoc = {
                matchscore,
                mentorId: best_mentor_id,
                startupId,
                status,
                successParams: {
                    partnerSecured: 0,
                    raisedFunding: 0,
                    revenueGrowth: 0
                },
                createdAt: Timestamp.now()
            };

            const relRef = await addDoc(collection(db, "relationships"), relationshipDoc);
            relationshipId = relRef.id;
            console.log(`✅ Relationship stored: ${relationshipId} (status: ${status})`);

            // Update mentor's relationships array
            const mentorRef = doc(db, "mentors", best_mentor_id);
            await updateDoc(mentorRef, {
                relationships: arrayUnion(relationshipId)
            });
            console.log(`✅ Mentor ${best_mentor_id} relationships updated with ${relationshipId}`);
        } else {
            console.log(`ℹ️ matchscore ${matchscore} < 60 — no relationship document created.`);
        }

        // 7. Return full result to caller
        return res.status(201).json({
            startupId,
            match: {
                best_mentor_id,
                matchscore,
                ai_reasoning
            },
            relationship: status
                ? { id: relationshipId, status }
                : { status: "none", reason: "matchscore below 60" }
        });

    } catch (err) {
        console.error("❌ /startups error:", err);
        res.status(500).json({ error: err.message });
    }
});

app.listen(port, () => console.log(`🚀 Server listening on port ${port}`));