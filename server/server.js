import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize, User, SearchRecord, Project } from './models.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env programmatically
try {
  const envPath = path.join(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
        process.env[key] = value;
      }
    });
    console.log('.env file loaded successfully.');
  }
} catch (err) {
  console.warn('Unable to load .env file:', err);
}

const app = express();
const PORT = 5000;
const JWT_SECRET = 'buildvision_super_secret_jwt_key_2026';

app.use(cors());
app.use(express.json());

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

// Sync Database
sequelize.sync({ alter: true }).then(() => {
  console.log('SQLite database synchronized successfully.');
}).catch((err) => {
  console.error('Error synchronizing SQLite database:', err);
});

// --- API ROUTES ---

// 1. User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      isPro: false
    });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, isPro: user.isPro }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, name: user.name, email: user.email, isPro: user.isPro });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server registration error' });
  }
});

// 2. User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const matches = await bcrypt.compare(password, user.password);
    if (!matches) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, isPro: user.isPro }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, name: user.name, email: user.email, isPro: user.isPro });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server login error' });
  }
});

// 3. Upgrade account to Pro (Stripe Payment simulation success callback)
app.post('/api/auth/upgrade', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.isPro = true;
    await user.save();

    // Re-issue JWT token with updated isPro status
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name, isPro: user.isPro }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, name: user.name, email: user.email, isPro: user.isPro });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upgrade transaction failed' });
  }
});

// 4. Log search queries
app.post('/api/searches', authenticateToken, async (req, res) => {
  try {
    const { plotWidth, plotLength, bedrooms, bathrooms, style, area, layoutVariation } = req.body;

    const record = await SearchRecord.create({
      plotWidth: parseInt(plotWidth),
      plotLength: parseInt(plotLength),
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      style,
      area: parseInt(area),
      layoutVariation,
      userId: req.user.id
    });

    res.status(201).json({ success: true, record });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log search' });
  }
});

// 5. Collaborative Suggestions Endpoint
app.get('/api/recommendations', authenticateToken, async (req, res) => {
  try {
    const trending = await SearchRecord.findAll({
      attributes: [
        'plotWidth', 'plotLength', 'bedrooms', 'bathrooms', 'style', 'area', 'layoutVariation',
        [sequelize.fn('COUNT', sequelize.col('id')), 'searchCount']
      ],
      group: ['plotWidth', 'plotLength', 'bedrooms', 'bathrooms', 'style', 'area', 'layoutVariation'],
      order: [[sequelize.literal('searchCount'), 'DESC']],
      limit: 3
    });

    const defaultFallbacks = [
      {
        id: 'rec-a',
        title: 'Modern Open-Concept',
        tag: 'Community Choice',
        area: 1800,
        width: 40,
        length: 60,
        bedrooms: 3,
        bathrooms: 2,
        style: 'Modern Villa',
        layoutVariation: 'A',
        description: 'Large open living-dining lounge with front glass deck. Selected by 45% of Villa buyers.',
        specs: 'Lounge: 20x24ft, Master Bed: 18x18ft.'
      },
      {
        id: 'rec-b',
        title: 'Smart Space-Saver',
        tag: 'Budget Efficient',
        area: 1200,
        width: 30,
        length: 40,
        bedrooms: 2,
        bathrooms: 2,
        style: 'Minimalist',
        layoutVariation: 'B',
        description: 'Zero corridor wastage. Shared bathroom plumbing setup. Maximizes closet spaces.',
        specs: 'Lounge: 18x21ft, Bedrooms: 12x14ft.'
      },
      {
        id: 'rec-c',
        title: 'Vastu-Compliant Courtyard',
        tag: 'Eco-Ventilated',
        area: 1500,
        width: 35,
        length: 50,
        bedrooms: 3,
        bathrooms: 2,
        style: 'Traditional',
        layoutVariation: 'C',
        description: 'Central skywell courtyard with traditional ventilation. Aligns kitchen in SE.',
        specs: 'Lounge: 16x20ft, Courtyard: 7x8ft.'
      }
    ];

    if (trending.length === 0) {
      return res.status(200).json(defaultFallbacks);
    }

    const recommendations = trending.map((item, idx) => {
      const w = item.plotWidth;
      const l = item.plotLength;
      const bhk = item.bedrooms;
      const styleName = item.style;
      const variation = item.layoutVariation;
      const areaVal = item.area;

      let title = 'Popular Configuration';
      let tag = 'Trending';
      let desc = '';

      if (variation === 'A') {
        title = 'Modern Open Concept';
        tag = `${item.get('searchCount')} Users Built`;
        desc = `Spacious integrated floor plan tailored for a ${w}x${l} plot. Chosen by users looking for high glazing.`;
      } else if (variation === 'B') {
        title = 'Smart Space-Saver';
        tag = 'High Demand';
        desc = `Highly functional, cost-saving configuration with compact corridors on a ${w}x${l} plot.`;
      } else {
        title = 'Vastu Courtyard';
        tag = 'Traditional Choice';
        desc = `Classic layout with central open courtyard skywell for optimized breeze and light.`;
      }

      return {
        id: `rec-db-${idx}`,
        title,
        tag,
        area: areaVal,
        width: w,
        length: l,
        bedrooms: bhk,
        bathrooms: item.bathrooms,
        style: styleName,
        layoutVariation: variation,
        description: desc,
        specs: `Lounge: ${Math.round(w*0.45)}x${Math.round(l*0.35)}ft`
      };
    });

    while (recommendations.length < 3) {
      const padIdx = recommendations.length;
      recommendations.push({
        ...defaultFallbacks[padIdx],
        id: `rec-pad-${padIdx}`
      });
    }

    res.status(200).json(recommendations);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

// --- PERSISTENT USER PROJECTS APIS ---

// A. Get Saved Projects
app.get('/api/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.findAll({
      where: { userId: req.user.id },
      order: [['updatedAt', 'DESC']]
    });
    res.status(200).json(projects);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve saved projects' });
  }
});

// B. Save Project Configuration
app.post('/api/projects', authenticateToken, async (req, res) => {
  try {
    const { name, plotWidth, plotLength, floors, bedrooms, bathrooms, style, budget, layoutOption } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await Project.create({
      name,
      plotWidth: parseInt(plotWidth),
      plotLength: parseInt(plotLength),
      floors: parseInt(floors),
      bedrooms: parseInt(bedrooms),
      bathrooms: parseInt(bathrooms),
      style,
      budget: parseInt(budget),
      layoutOption,
      userId: req.user.id
    });

    res.status(201).json({ success: true, project });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save project' });
  }
});

// C. Delete Project
app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found or unauthorized' });
    }

    await project.destroy();
    res.status(200).json({ success: true, message: 'Project deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// AI Blueprint Generation using Gemini
app.post('/api/ai/generate', async (req, res) => {
  try {
    const { prompt, width, length, bhk, style } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      console.warn('Gemini API key is not configured in .env');
      return res.status(400).json({ error: 'GEMINI_API_KEY_NOT_SET' });
    }

    if (!width || !length) {
      return res.status(400).json({ error: 'Plot dimensions are required' });
    }

    const sysInstruction = `You are a highly experienced residential architect and structural engineer who designs realistic, buildable, and code-compliant floor plans.
Generate exactly 3 distinct, practical residential floorplan layout variants based on the user's input:
- Option A: Modern Open Concept
- Option B: Space-Saving / Highly Functional
- Option C: Traditional / Vastu Compliant

You MUST adhere to these strict architectural rules to ensure the blueprints are feasible for real-life construction:

1. SETBACKS & BUILD AREA BOUNDARIES:
- Plot Dimensions are given as width and length in feet.
- Standard setbacks: Front Setback = 5 ft, Back Setback = 4 ft, Side Setbacks = 3 ft (left and right).
- All rooms, walls, doors, and windows MUST sit strictly inside the buildable envelope: from x = 3 to x = (width - 3), and y = 4 to y = (length - 5). Do not draw walls or rooms outside these boundaries!

2. REASONABLE ROOM SIZES & LABELS:
- All room dimensions (w, h) must represent real-world feasibility:
  * Living Room: 12x15 ft to 18x24 ft.
  * Master Bedroom: 12x14 ft to 14x16 ft.
  * Secondary Bedrooms: 10x10 ft to 12x12 ft.
  * Kitchen: 8x10 ft to 10x12 ft.
  * Bathrooms: 5x8 ft to 7x9 ft.
  * Foyer / Passages: Width must be 3 to 4 ft.
  * Balconies: Width 3 to 5 ft.
- Every room must be labeled accurately (e.g., "Living Room", "Master Bedroom", "Kitchen", "Dining Room", "Common Bathroom", "Master Bathroom").
- Avoid creating tiny, unlivable rooms. Bounding boxes must not overlap each other!

3. COHERENT FLOOR-BY-FLOOR UTILITY RULES:
- The base floor is floor: 0 (Ground Floor). Upper floors are floor: 1 (First Floor), floor: 2 (Second Floor).
- Floor 0 (Ground Floor) MUST contain the main entryway, a Living Room, Dining Room, Kitchen, and at least one Bathroom. If the layout requires bedrooms, put at least one bedroom on Floor 0.
- Floor 1 and Floor 2 (Upper Floors) are for private rooms: Bedrooms, family lounge, study, attached bathrooms, and balconies.
- CRITICAL: Never place a Kitchen on Floor 1 or 2. Kitchen MUST only be on Floor 0.
- If the plan is single-story, fit everything on Floor 0.

4. DOOR ACCESS & ACCESSIBILITY (NO ENCLOSED ROOMS):
- Every room box must have at least one door connecting it to a common area (hallway, lobby, or living room) or to an adjacent room. Do not seal rooms completely with walls!
- Place door coordinates (x, y) exactly on the partition wall separating the room from the access area, with the door pointing inside.
- Master Bathrooms must have a door opening directly into the Master Bedroom. Common Bathrooms must have doors opening to hallways or living areas.

5. WALLS AND ALIGNMENTS:
- Draw walls as clean, straight lines (horizontal or vertical).
- External walls must form a solid outer box tracing the buildable envelope boundaries.
- Internal partition walls must trace the room boxes exactly. Room borders must align perfectly with wall lines.
- Do not overlay duplicate walls or create double wall segments to avoid visual rendering noise.

6. WINDOW PLACEMENT:
- Windows must be placed ONLY on exterior walls (facing outside the buildable envelope, e.g., the front yard, back yard, or side yards) to allow ventilation and light. Never place windows on internal partition walls!

7. FURNITURE PLACEMENT RULES:
- Place furniture logically inside the rooms (e.g. beds in bedrooms, sofas/dining tables in living/dining areas, toilets/sinks in bathrooms, counters/burners in kitchen).
- Ensure furniture coordinates fit inside their respective room boundaries.

8. SCHEMA CONTROL:
Output a single, raw JSON object matching this schema. No markdown formatting:
{
  "options": [
    {
      "title": "Variant 1 Name",
      "tag": "e.g. Open-Concept",
      "description": "Short description of Variant 1",
      "width": number,
      "length": number,
      "bedrooms": number,
      "bathrooms": number,
      "style": string,
      "layoutVariation": "A",
      "layoutData": {
        "rooms": [
          { "label": string, "type": "bedroom"|"bathroom"|"kitchen"|"living"|"dining"|"utility"|"balcony", "x": number, "y": number, "w": number, "h": number, "floor": number }
        ],
        "walls": [
          { "x1": number, "y1": number, "x2": number, "y2": number, "floor": number }
        ],
        "doors": [
          { "x": number, "y": number, "angle": 0|90|180|270, "size": number, "floor": number }
        ],
        "windows": [
          { "x": number, "y": number, "size": number, "isVertical": boolean, "floor": number }
        ],
        "furniture": [
          { "type": "bed"|"sofa"|"dining"|"toilet"|"sink"|"kitchen", "x": number, "y": number, "w": number, "h": number, "rotation": number, "floor": number }
        ]
      }
    },
    {
      "title": "Variant 2 Name",
      "tag": "e.g. Space-Saver",
      "description": "Short description of Variant 2",
      "width": number,
      "length": number,
      "bedrooms": number,
      "bathrooms": number,
      "style": string,
      "layoutVariation": "B",
      "layoutData": {
        "rooms": [
          { "label": string, "type": "bedroom"|"bathroom"|"kitchen"|"living"|"dining"|"utility"|"balcony", "x": number, "y": number, "w": number, "h": number, "floor": number }
        ],
        "walls": [
          { "x1": number, "y1": number, "x2": number, "y2": number, "floor": number }
        ],
        "doors": [
          { "x": number, "y": number, "angle": 0|90|180|270, "size": number, "floor": number }
        ],
        "windows": [
          { "x": number, "y": number, "size": number, "isVertical": boolean, "floor": number }
        ],
        "furniture": [
          { "type": "bed"|"sofa"|"dining"|"toilet"|"sink"|"kitchen", "x": number, "y": number, "w": number, "h": number, "rotation": number, "floor": number }
        ]
      }
    },
    {
      "title": "Variant 3 Name",
      "tag": "e.g. Courtyard / Traditional",
      "description": "Short description of Variant 3",
      "width": number,
      "length": number,
      "bedrooms": number,
      "bathrooms": number,
      "style": string,
      "layoutVariation": "C",
      "layoutData": {
        "rooms": [
          { "label": string, "type": "bedroom"|"bathroom"|"kitchen"|"living"|"dining"|"utility"|"balcony", "x": number, "y": number, "w": number, "h": number, "floor": number }
        ],
        "walls": [
          { "x1": number, "y1": number, "x2": number, "y2": number, "floor": number }
        ],
        "doors": [
          { "x": number, "y": number, "angle": 0|90|180|270, "size": number, "floor": number }
        ],
        "windows": [
          { "x": number, "y": number, "size": number, "isVertical": boolean, "floor": number }
        ],
        "furniture": [
          { "type": "bed"|"sofa"|"dining"|"toilet"|"sink"|"kitchen", "x": number, "y": number, "w": number, "h": number, "rotation": number, "floor": number }
        ]
      }
    }
  ]
}
Return ONLY the raw JSON content. Do not wrap it in markdown code blocks.`;

    const userPrompt = `Generate exactly 3 layout variants for: "${prompt || 'standard house'}".
Dimensions: ${width}x${length} ft.
BHK: ${bhk || 2} BHK.
Style: ${style || 'Modern Villa'}.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: userPrompt }]
            }
          ],
          systemInstruction: {
            parts: [{ text: sysInstruction }]
          },
          generationConfig: {
            responseMimeType: 'application/json'
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API request failed:', errorText);
      return res.status(502).json({ error: 'Gemini API call failed' });
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!resultText) {
      return res.status(500).json({ error: 'Empty response from Gemini API' });
    }

    const parsedLayout = JSON.parse(resultText.trim());
    res.status(200).json(parsedLayout);

  } catch (err) {
    console.error('Error in /api/ai/generate:', err);
    res.status(500).json({ error: 'Internal server generation error' });
  }
});

app.listen(PORT, () => {
  console.log(`BuildVision Express server listening on http://localhost:${PORT}`);
});

