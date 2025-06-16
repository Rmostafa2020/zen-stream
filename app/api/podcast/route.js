// import { GoogleGenerativeAI } from "@google/generative-ai";
// import dbConnect from "@/backend/models/lib/mongodb";
// import mongoose from "mongoose";

// // Initialize client
// const aiGen = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// // Exact same embedding method as your Python code
// async function generateEmbedding(text) {
//   const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${process.env.GEMINI_API_KEY}`;
  
//   const response = await fetch(url, {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       content: { parts: [{ text: text }] }
//     })
//   });

//   if (!response.ok) {
//     throw new Error(`Embedding API failed: ${response.status}`);
//   }

//   const data = await response.json();
//   return data.embedding.values; // Same as Python: emb.values
// }

// export async function POST(request) {
//   try {
//     const { tag } = await request.json();
//     if (!tag) {
//       return new Response(JSON.stringify({ error: 'Tag is required' }), { status: 400 });
//     }

//     await dbConnect();

//     console.log("=== BYPASSING MONGOOSE - USING DIRECT COLLECTION ACCESS ===");
    
//     // Use direct collection access instead of Mongoose (avoiding schema issues)
//     const collection = mongoose.connection.db.collection('rag_data');
    
//     // Check collection directly
//     const totalDocs = await collection.countDocuments();
//     console.log("Direct collection count:", totalDocs);
    
//     if (totalDocs === 0) {
//       return new Response(JSON.stringify({ 
//         error: 'No documents found in collection',
//         debug: { totalDocs }
//       }), { status: 404 });
//     }

//     // Get sample document to verify structure
//     const sampleDoc = await collection.findOne({});
//     console.log("Sample document structure:", {
//       hasQuote: !!sampleDoc.quote,
//       hasTag: !!sampleDoc.tag,
//       hasEmbedding: !!sampleDoc.embedding,
//       embeddingType: Array.isArray(sampleDoc.embedding) ? 'array' : typeof sampleDoc.embedding,
//       embeddingLength: sampleDoc.embedding?.length,
//       sampleTag: sampleDoc.tag,
//       sampleQuote: sampleDoc.quote?.slice(0, 50) + "..."
//     });

//     console.log("\n=== FINDING DOCUMENTS WITH MATCHING TAG ===");
    
//     // Find documents with matching tag (case-insensitive)
//     const tagUpper = tag.toUpperCase();
//     const tagLower = tag.toLowerCase();
    
//     // Try multiple case variations
//     const docsWithTag = await collection.find({
//       $or: [
//         { tag: tag },
//         { tag: tagUpper },
//         { tag: tagLower },
//         { tag: { $regex: new RegExp(`^${tag}$`, 'i') } }
//       ]
//     }).limit(5).toArray();
    
//     console.log(`Found ${docsWithTag.length} documents with tag variations of "${tag}"`);
    
//     if (docsWithTag.length > 0) {
//       console.log("Matching documents:");
//       docsWithTag.forEach((doc, i) => {
//         console.log(`  ${i+1}. Tag: "${doc.tag}", Quote: "${doc.quote?.slice(0, 50)}..."`);
//       });
//     }

//     console.log("\n=== GENERATING QUERY EMBEDDING ===");
    
//     // Generate embedding using EXACT same format as Python
//     let embeddingText;
//     if (docsWithTag.length > 0) {
//       // Use actual quote format from your data: "TAG: quote"
//       embeddingText = `${docsWithTag[0].tag}: ${docsWithTag[0].quote}`;
//       console.log("Using actual document format:", embeddingText.slice(0, 100) + "...");
//     } else {
//       // Fallback with uppercase tag (matching your Python format)
//       embeddingText = `${tagUpper}: positive inspirational quote about ${tagUpper.toLowerCase()}`;
//       console.log("Using fallback format:", embeddingText);
//     }
    
//     const queryEmbedding = await generateEmbedding(embeddingText);
//     console.log("Query embedding generated - length:", queryEmbedding.length);
//     console.log("First 5 values:", queryEmbedding.slice(0, 5));

//     console.log("\n=== TESTING VECTOR SEARCH ===");
    
//     // First, test if vector search works at all using a stored embedding
//     console.log("Testing with stored embedding...");
//     const testDoc = await collection.findOne({ embedding: { $exists: true, $ne: [] } });
    
//     if (testDoc && testDoc.embedding) {
//       console.log("Testing vector search with stored embedding...");
//       const testPipeline = [
//         {
//           $vectorSearch: {
//             index: "vector_index",
//             path: "embedding",
//             queryVector: testDoc.embedding, // Use actual stored embedding
//             numCandidates: 10,
//             limit: 3
//           }
//         },
//         { $project: { quote: 1, tag: 1, score: { $meta: "vectorSearchScore" } } }
//       ];
      
//       const testResults = await collection.aggregate(testPipeline).toArray();
//       console.log(`Test search with stored embedding found ${testResults.length} results`);
      
//       if (testResults.length === 0) {
//         console.log("ERROR: Vector search index not working!");
//         console.log("Check your MongoDB Atlas Vector Search index configuration:");
//         console.log("- Index name: 'vector_index'");
//         console.log("- Path: 'embedding'");
//         console.log("- Dimensions: 768");
//         console.log("- Similarity: cosine");
//       }
//     }

//     // Now try with generated query embedding
//     console.log("\n=== PERFORMING ACTUAL VECTOR SEARCH ===");
//     const vectorPipeline = [
//       {
//         $vectorSearch: {
//           index: "vector_index",
//           path: "embedding",
//           queryVector: queryEmbedding,
//           numCandidates: 300, // Increased significantly
//           limit: 10 // Increased limit
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

//     console.log("Vector search pipeline:", JSON.stringify(vectorPipeline[0].$vectorSearch, null, 2));
    
//     const topDocs = await collection.aggregate(vectorPipeline).toArray();
//     console.log(`Vector search found ${topDocs.length} documents`);
    
//     if (topDocs.length > 0) {
//       console.log("Results:");
//       topDocs.forEach((doc, i) => {
//         console.log(`  ${i+1}. Score: ${doc.score?.toFixed(3)} - Tag: "${doc.tag}" - Quote: "${doc.quote?.slice(0, 60)}..."`);
//       });
//     } else {
//       console.log("Still no results. Trying broader search...");
      
//       // Try with lower numCandidates and check if any documents have embeddings
//       const docsWithEmbeddings = await collection.find({ 
//         embedding: { $exists: true, $type: "array", $ne: [] } 
//       }).limit(5).toArray();
      
//       console.log(`Found ${docsWithEmbeddings.length} documents with valid embeddings`);
      
//       if (docsWithEmbeddings.length > 0) {
//         console.log("Sample embedding lengths:", docsWithEmbeddings.map(d => d.embedding?.length));
//         console.log("Your query embedding length:", queryEmbedding.length);
        
//         // Check if dimensions match
//         const storedLength = docsWithEmbeddings[0].embedding?.length;
//         if (storedLength !== queryEmbedding.length) {
//           console.log(`DIMENSION MISMATCH: Stored=${storedLength}, Query=${queryEmbedding.length}`);
//         }
//       }
//     }

//     console.log("\n=== GENERATING SCRIPT ===");
    
//     // Build prompt with found quotes or fallback
//     const quotesText = topDocs.length > 0 
//       ? topDocs.map(q => `"${q.quote}"`).join("\n")
//       : `No specific quotes found for "${tag}", but here are some uplifting thoughts about ${tag.toLowerCase()}.`;

//     const prompt = `
// You are a creative and optimistic podcast scriptwriter.
// Here are some inspirational quotes related to the topic "${tag}":
// ${quotesText}

// Your task is to generate a short, safe-for-work, and positive podcast script that is meant to be spoken aloud only. Do not include any stage directions, sound effects, or non-spoken text. Only output what the host would say.
// The script should be about the topic: "${tag}" and may reference or be inspired by the above quotes.

// Structure the script with three parts: a welcoming introduction, uplifting main content, and a positive conclusion. Do not include any section headers like "Intro:", "Main Content:", or "Outro:" in your output. Just write the script as if the host is speaking naturally from start to finish.

// The tone should be encouraging, lighthearted, and family-friendly.
// Do not include any controversial, negative, or sensitive content.
// `;

//     // Generate script
//     const model = aiGen.getGenerativeModel({ model: "gemini-1.5-flash" });
//     const result = await model.generateContent(prompt);
//     const script = result.response.text();

//     // Validate quote usage
//     const usedQuotes = topDocs.filter(doc => 
//       script.toLowerCase().includes(doc.quote?.split(' ')[0]?.toLowerCase())
//     );

//     console.log("\n=== FINAL RESULTS ===");
//     console.log(`Script generated. Uses ${usedQuotes.length}/${topDocs.length} retrieved quotes.`);

//     return new Response(JSON.stringify({ 
//       script,
//       // debug: {
//       //   totalDocuments: totalDocs,
//       //   embeddingText,
//       //   embeddingDimensions: queryEmbedding.length,
//       //   documentsFound: topDocs.length,
//       //   searchScores: topDocs.map(d => d.score),
//       //   foundQuotes: topDocs.map(d => d.quote),
//       //   usedQuotes: usedQuotes.map(q => q.quote),
//       //   vectorSearchWorking: topDocs.length > 0,
//       //   sampleDocumentStructure: {
//       //     hasQuote: !!sampleDoc.quote,
//       //     hasTag: !!sampleDoc.tag,
//       //     hasEmbedding: !!sampleDoc.embedding,
//       //     embeddingLength: sampleDoc.embedding?.length
//       //   }
//       // }
//     }), {
//       status: 200,
//       headers: { "Content-Type": "application/json" }
//     });

//   } catch (error) {
//     console.error("\n=== ERROR ===");
//     console.error("Error message:", error.message);
//     console.error("Stack:", error.stack);
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
  return data.embedding.values;
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

    // Vector search
    console.log("\n=== PERFORMING VECTOR SEARCH ===");
    const vectorPipeline = [
      {
        $vectorSearch: {
          index: "vector_index",
          path: "embedding",
          queryVector: queryEmbedding,
          numCandidates: 300,
          limit: 10
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

    const topDocs = await collection.aggregate(vectorPipeline).toArray();
    console.log(`Vector search found ${topDocs.length} documents`);
    
    if (topDocs.length > 0) {
      console.log("Results:");
      topDocs.forEach((doc, i) => {
        console.log(`  ${i+1}. Score: ${doc.score?.toFixed(3)} - Tag: "${doc.tag}" - Quote: "${doc.quote?.slice(0, 60)}..."`);
      });
    }

    console.log("\n=== GENERATING SCRIPT AND TITLE ===");
    
    // Build prompt with found quotes or fallback
    const quotesText = topDocs.length > 0 
      ? topDocs.map(q => `"${q.quote}"`).join("\n")
      : `No specific quotes found for "${tag}", but here are some uplifting thoughts about ${tag.toLowerCase()}.`;

    const prompt = `
You are a creative and optimistic podcast scriptwriter.
Here are some inspirational quotes related to the topic "${tag}":
${quotesText}

Your task is to generate:
1. A catchy, engaging podcast episode title about "${tag}"
2. A short, safe-for-work, and positive podcast script that is meant to be spoken aloud only

The script should:
- Be about the topic: "${tag}" and may reference or be inspired by the above quotes
- Have a welcoming introduction, uplifting main content, and positive conclusion
- Be spoken naturally from start to finish (no stage directions, sound effects, or section headers)
- Use an encouraging, lighthearted, and family-friendly tone
- Not include any controversial, negative, or sensitive content

The title should:
- Be engaging and clickable
- Capture the essence of the "${tag}" topic
- Be appropriate for a positive, inspirational podcast
- Be between 5-12 words long
`;

    // Generate with structured output to get both title and script
    const model = aiGen.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "The podcast episode title"
            },
            script: {
              type: "string", 
              description: "The complete podcast script to be spoken aloud"
            }
          },
          required: ["title", "script"]
        }
      }
    });

    const result = await model.generateContent(prompt);
    const response = JSON.parse(result.response.text());

    // Validate quote usage
    const usedQuotes = topDocs.filter(doc => 
      response.script.toLowerCase().includes(doc.quote?.split(' ')[0]?.toLowerCase())
    );

    console.log("\n=== FINAL RESULTS ===");
    console.log(`Generated title: "${response.title}"`);
    console.log(`Script uses ${usedQuotes.length}/${topDocs.length} retrieved quotes.`);
    const title = response.title;
    const script = response.script;

    // Call `/api/podcast/save` to save the podcast
    const saveResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/podcast/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, script }),
    });

    const saveResult = await saveResponse.json();


    return new Response(JSON.stringify({ 
      title: response.title,
      script: response.script,
      // debug: {
      //   totalDocuments: totalDocs,
      //   embeddingText,
      //   embeddingDimensions: queryEmbedding.length,
      //   documentsFound: topDocs.length,
      //   searchScores: topDocs.map(d => d.score),
      //   foundQuotes: topDocs.map(d => d.quote),
      //   usedQuotes: usedQuotes.map(q => q.quote),
      //   vectorSearchWorking: topDocs.length > 0
      // }
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
