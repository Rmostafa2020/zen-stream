// import { GoogleGenAI } from "@google/genai";

// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// export async function POST(request) {
//   try {
//     const { tag } = await request.json();

//     if (!tag) {
//       return new Response(JSON.stringify({ error: 'Tag is required' }), { status: 400 });
//     }

//     const prompt = `
//       You are a creative and optimistic podcast scriptwriter.
//       Your task is to generate a short, safe-for-work, and positive podcast script that is meant to be spoken aloud only. Do not include any stage directions, sound effects, or non-spoken text. Only output what the host would say.
//       The script should be about the topic: "${tag}".

//       Structure the script with three parts: a welcoming introduction, uplifting main content, and a positive conclusion. 
//       **Do not include any section headers or labels like "Intro:", "Main Content:", or "Outro:" in your output.** 
//       Just write the script as if the host is speaking naturally from start to finish.

//       The tone should be encouraging, lighthearted, and family-friendly.
//       Do not include any controversial, negative, or sensitive content.
//     `;

//     const response = await ai.models.generateContent({
//       model: "gemini-2.0-flash",
//       contents: prompt,
//     });

//     return new Response(JSON.stringify({ script: response.text }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" }
//     });

//   } catch (error) {
//     console.error("Error generating podcast script:", error);
//     return new Response(JSON.stringify({ error: 'Failed to generate podcast script' }), { status: 500 });
//   }
// }

// import { GoogleGenerativeAI } from "@google/generative-ai";
// import dbConnect from "@/backend/models/lib/mongodb";
// import mongoose from "mongoose";

// // Your EmbeddingGenerator class
// class EmbeddingGenerator {
//   constructor(apiKey) {
//     this.apiKey = apiKey;
//     this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent';
//   }

//   async getEmbedding(text) {
//     const url = `${this.baseUrl}?key=${this.apiKey}`;
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         content: {
//           parts: [{ text: text }]
//         }
//       })
//     });
//     if (!response.ok) {
//       throw new Error(`API request failed: ${response.status}`);
//     }
//     const data = await response.json();
//     return data.embedding.values;
//   }
// }

// // Schema setup
// const ragDataSchema = new mongoose.Schema({
//   quote: String,
//   embedding: [Number],
//   tag: String,
// });
// const RAGData = mongoose.models.RAGData || mongoose.model("RAGData", ragDataSchema);

// // Initialize clients
// const embeddingGenerator = new EmbeddingGenerator(process.env.GEMINI_API_KEY);
// const aiGen = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// export async function POST(request) {
//   try {
//     const { tag } = await request.json();
//     if (!tag) {
//       return new Response(JSON.stringify({ error: 'Tag is required' }), { status: 400 });
//     }

//     await dbConnect();

//     // 1. Get embedding using your class
//     console.log("\n=== START EMBEDDING GENERATION ===");
//     const embeddingResponse = await embeddingGenerator.getEmbedding(`${tag}: ${tag}`);
//     console.log("Generated embedding:", tag, embeddingResponse.slice(0, 5));
//     console.log("Embedding length:", embeddingResponse.length);

//     // 2. Check data and sample
//     const count = await RAGData.countDocuments();
//     console.log("Total documents in RAGData:", count);
//     const sample = await RAGData.findOne();
//     console.log("Sample embedding:", sample?.embedding?.slice?.(0, 5));

//     // 3. Vector search pipeline
//     const vectorPipeline = [
//       {
//         $vectorSearch: {
//           index: "vector_index",
//           path: "embedding",
//           queryVector: embeddingResponse,
//           numCandidates: 100,
//           limit: 3
//         }
//       },
//       {
//         $project: {
//           quote: 1,
//           tag: 1,
//           score: { $meta: "vectorSearchScore" }
//         }
//       }
//     ];
//     console.log("\n=== VECTOR SEARCH PIPELINE ===");
//     console.log(vectorPipeline);

//     const topDocs = await RAGData.aggregate(vectorPipeline);
//     console.log("\n=== SEARCH RESULTS ===");
//     console.log("Found documents:", topDocs.length);
//     topDocs.forEach((d, i) => console.log(`#${i+1}: "${d.quote}" (tag: ${d.tag}, score: ${d.score?.toFixed(3)})`));

//     // 4. Build prompt
//     const quotesText = topDocs.map(q => `"${q.quote}"`).join("\n");
//     const prompt = `
// You are a creative and optimistic podcast scriptwriter.
// Here are some inspirational quotes related to the topic "${tag}":
// ${quotesText || "No quotes found."}

// Your task is to generate a short, safe-for-work, and positive podcast script that is meant to be spoken aloud only. Do not include any stage directions, sound effects, or non-spoken text. Only output what the host would say.
// The script should be about the topic: "${tag}" and may reference or be inspired by the above quotes.

// Structure the script with three parts: a welcoming introduction, uplifting main content, and a positive conclusion. Do not include any section headers or labels like "Intro:", "Main Content:", or "Outro:" in your output. Just write the script as if the host is speaking naturally from start to finish.

// The tone should be encouraging, lighthearted, and family-friendly.
// Do not include any controversial, negative, or sensitive content.
// `;
//     console.log("\n=== PROMPT SENT TO GEMINI ===");
//     console.log(prompt.slice(0, 300) + (prompt.length > 300 ? "..." : ""));

//     // 5. Generate script
//     const model = aiGen.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(prompt);
//     const script = result.response.text();

//     // 6. Validate quote usage
//     const usedQuotes = topDocs.filter(doc => 
//       script.toLowerCase().includes(doc.quote.split(' ')[0].toLowerCase())
//     );
//     console.log("\n=== SCRIPT VALIDATION ===");
//     console.log(`Script references ${usedQuotes.length}/${topDocs.length} quotes`);
//     console.log("Script preview:", script.slice(0, 300) + (script.length > 300 ? "..." : ""));

//     // 7. Response
//     return new Response(JSON.stringify({ 
//       script,
//       debug: {
//         embeddingDimensions: embeddingResponse.length,
//         searchScores: topDocs.map(d => d.score),
//         foundQuotes: topDocs.map(d => d.quote),
//         usedQuotes: usedQuotes.map(q => q.quote),
//         documentsFound: topDocs.length
//       }
//     }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" }
//     });

//   } catch (error) {
//     console.error("\n=== ERROR ===");
//     console.error(error.message);
//     console.error(error.stack);
//     return new Response(JSON.stringify({ 
//       error: 'Failed to generate script',
//       details: process.env.NODE_ENV === 'development' ? error.message : null
//     }), { status: 500 });
//   }
// }

import { GoogleGenerativeAI } from "@google/generative-ai";
import dbConnect from "@/backend/models/lib/mongodb";
import mongoose from "mongoose";

// Initialize client
const aiGen = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Exact same embedding method as your Python code
async function generateEmbedding(text) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: { parts: [{ text: text }] }
    })
  });

  if (!response.ok) {
    throw new Error(`Embedding API failed: ${response.status}`);
  }

  const data = await response.json();
  return data.embedding.values; // Same as Python: emb.values
}

export async function POST(request) {
  try {
    const { tag } = await request.json();
    if (!tag) {
      return new Response(JSON.stringify({ error: 'Tag is required' }), { status: 400 });
    }

    await dbConnect();

    console.log("=== BYPASSING MONGOOSE - USING DIRECT COLLECTION ACCESS ===");
    
    // Use direct collection access instead of Mongoose (avoiding schema issues)
    const collection = mongoose.connection.db.collection('rag_data');
    
    // Check collection directly
    const totalDocs = await collection.countDocuments();
    console.log("Direct collection count:", totalDocs);
    
    if (totalDocs === 0) {
      return new Response(JSON.stringify({ 
        error: 'No documents found in collection',
        debug: { totalDocs }
      }), { status: 404 });
    }

    // Get sample document to verify structure
    const sampleDoc = await collection.findOne({});
    console.log("Sample document structure:", {
      hasQuote: !!sampleDoc.quote,
      hasTag: !!sampleDoc.tag,
      hasEmbedding: !!sampleDoc.embedding,
      embeddingType: Array.isArray(sampleDoc.embedding) ? 'array' : typeof sampleDoc.embedding,
      embeddingLength: sampleDoc.embedding?.length,
      sampleTag: sampleDoc.tag,
      sampleQuote: sampleDoc.quote?.slice(0, 50) + "..."
    });

    console.log("\n=== FINDING DOCUMENTS WITH MATCHING TAG ===");
    
    // Find documents with matching tag (case-insensitive)
    const tagUpper = tag.toUpperCase();
    const tagLower = tag.toLowerCase();
    
    // Try multiple case variations
    const docsWithTag = await collection.find({
      $or: [
        { tag: tag },
        { tag: tagUpper },
        { tag: tagLower },
        { tag: { $regex: new RegExp(`^${tag}$`, 'i') } }
      ]
    }).limit(5).toArray();
    
    console.log(`Found ${docsWithTag.length} documents with tag variations of "${tag}"`);
    
    if (docsWithTag.length > 0) {
      console.log("Matching documents:");
      docsWithTag.forEach((doc, i) => {
        console.log(`  ${i+1}. Tag: "${doc.tag}", Quote: "${doc.quote?.slice(0, 50)}..."`);
      });
    }

    console.log("\n=== GENERATING QUERY EMBEDDING ===");
    
    // Generate embedding using EXACT same format as Python
    let embeddingText;
    if (docsWithTag.length > 0) {
      // Use actual quote format from your data: "TAG: quote"
      embeddingText = `${docsWithTag[0].tag}: ${docsWithTag[0].quote}`;
      console.log("Using actual document format:", embeddingText.slice(0, 100) + "...");
    } else {
      // Fallback with uppercase tag (matching your Python format)
      embeddingText = `${tagUpper}: positive inspirational quote about ${tagUpper.toLowerCase()}`;
      console.log("Using fallback format:", embeddingText);
    }
    
    const queryEmbedding = await generateEmbedding(embeddingText);
    console.log("Query embedding generated - length:", queryEmbedding.length);
    console.log("First 5 values:", queryEmbedding.slice(0, 5));

    console.log("\n=== TESTING VECTOR SEARCH ===");
    
    // First, test if vector search works at all using a stored embedding
    console.log("Testing with stored embedding...");
    const testDoc = await collection.findOne({ embedding: { $exists: true, $ne: [] } });
    
    if (testDoc && testDoc.embedding) {
      console.log("Testing vector search with stored embedding...");
      const testPipeline = [
        {
          $vectorSearch: {
            index: "vector_index",
            path: "embedding",
            queryVector: testDoc.embedding, // Use actual stored embedding
            numCandidates: 10,
            limit: 3
          }
        },
        { $project: { quote: 1, tag: 1, score: { $meta: "vectorSearchScore" } } }
      ];
      
      const testResults = await collection.aggregate(testPipeline).toArray();
      console.log(`Test search with stored embedding found ${testResults.length} results`);
      
      if (testResults.length === 0) {
        console.log("ERROR: Vector search index not working!");
        console.log("Check your MongoDB Atlas Vector Search index configuration:");
        console.log("- Index name: 'vector_index'");
        console.log("- Path: 'embedding'");
        console.log("- Dimensions: 768");
        console.log("- Similarity: cosine");
      }
    }

    // Now try with generated query embedding
    console.log("\n=== PERFORMING ACTUAL VECTOR SEARCH ===");
    const vectorPipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 300, // Increased significantly
          limit: 10 // Increased limit
        }
      },
      {
        $project: {
          quote: 1,
          tag: 1,
          score: { $meta: "vectorSearchScore" }
        }
      }
    ];

    console.log("Vector search pipeline:", JSON.stringify(vectorPipeline[0].$vectorSearch, null, 2));
    
    const topDocs = await collection.aggregate(vectorPipeline).toArray();
    console.log(`Vector search found ${topDocs.length} documents`);
    
    if (topDocs.length > 0) {
      console.log("Results:");
      topDocs.forEach((doc, i) => {
        console.log(`  ${i+1}. Score: ${doc.score?.toFixed(3)} - Tag: "${doc.tag}" - Quote: "${doc.quote?.slice(0, 60)}..."`);
      });
    } else {
      console.log("Still no results. Trying broader search...");
      
      // Try with lower numCandidates and check if any documents have embeddings
      const docsWithEmbeddings = await collection.find({ 
        embedding: { $exists: true, $type: "array", $ne: [] } 
      }).limit(5).toArray();
      
      console.log(`Found ${docsWithEmbeddings.length} documents with valid embeddings`);
      
      if (docsWithEmbeddings.length > 0) {
        console.log("Sample embedding lengths:", docsWithEmbeddings.map(d => d.embedding?.length));
        console.log("Your query embedding length:", queryEmbedding.length);
        
        // Check if dimensions match
        const storedLength = docsWithEmbeddings[0].embedding?.length;
        if (storedLength !== queryEmbedding.length) {
          console.log(`DIMENSION MISMATCH: Stored=${storedLength}, Query=${queryEmbedding.length}`);
        }
      }
    }

    console.log("\n=== GENERATING SCRIPT ===");
    
    // Build prompt with found quotes or fallback
    const quotesText = topDocs.length > 0 
      ? topDocs.map(q => `"${q.quote}"`).join("\n")
      : `No specific quotes found for "${tag}", but here are some uplifting thoughts about ${tag.toLowerCase()}.`;

    const prompt = `
You are a creative and optimistic podcast scriptwriter.
Here are some inspirational quotes related to the topic "${tag}":
${quotesText}

Your task is to generate a short, safe-for-work, and positive podcast script that is meant to be spoken aloud only. Do not include any stage directions, sound effects, or non-spoken text. Only output what the host would say.
The script should be about the topic: "${tag}" and may reference or be inspired by the above quotes.

Structure the script with three parts: a welcoming introduction, uplifting main content, and a positive conclusion. Do not include any section headers or labels like "Intro:", "Main Content:", or "Outro:" in your output. Just write the script as if the host is speaking naturally from start to finish.

The tone should be encouraging, lighthearted, and family-friendly.
Do not include any controversial, negative, or sensitive content.
`;

    // Generate script
    const model = aiGen.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const script = result.response.text();

    // Validate quote usage
    const usedQuotes = topDocs.filter(doc => 
      script.toLowerCase().includes(doc.quote?.split(' ')[0]?.toLowerCase())
    );

    console.log("\n=== FINAL RESULTS ===");
    console.log(`Script generated. Uses ${usedQuotes.length}/${topDocs.length} retrieved quotes.`);

    return new Response(JSON.stringify({ 
      script,
      debug: {
        totalDocuments: totalDocs,
        embeddingText,
        embeddingDimensions: queryEmbedding.length,
        documentsFound: topDocs.length,
        searchScores: topDocs.map(d => d.score),
        foundQuotes: topDocs.map(d => d.quote),
        usedQuotes: usedQuotes.map(q => q.quote),
        vectorSearchWorking: topDocs.length > 0,
        sampleDocumentStructure: {
          hasQuote: !!sampleDoc.quote,
          hasTag: !!sampleDoc.tag,
          hasEmbedding: !!sampleDoc.embedding,
          embeddingLength: sampleDoc.embedding?.length
        }
      }
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("\n=== ERROR ===");
    console.error("Error message:", error.message);
    console.error("Stack:", error.stack);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate script',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    }), { status: 500 });
  }
}
