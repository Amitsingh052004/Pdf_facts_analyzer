from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import io
import re
import json
import os
from dotenv import load_dotenv
from openai import OpenAI

# Load environment variables
load_dotenv()

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

# Allow frontend (Next.js) to call backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for testing, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/analyze")
async def analyze_pdf(
    pdf: UploadFile = File(None, alias="pdf"),   # accept "pdf"
    file: UploadFile = File(None, alias="file"), # or accept "file"
    pointers: str = Form(...)
):
    """
    Accepts:
      - pdf or file: PDF file uploaded
      - pointers: JSON array string like ["List all dates", "Who signed?", "Extract email id"]
    Returns:
      {
        "results": [
          {
            "pointer": "...",
            "snippets": [
              { "text": "...", "page": 1, "offset": { "start": 10, "end": 25 } }
            ],
            "rationale": "..."
          }
        ]
      }
    """

    # pick whichever was sent
    upload = pdf or file
    if not upload:
        raise HTTPException(status_code=400, detail="No PDF file uploaded")

    # Convert pointers string to Python list safely
    try:
        queries = json.loads(pointers)
        if not isinstance(queries, list):
            raise ValueError()
    except Exception:
        raise HTTPException(status_code=400, detail="Pointers must be a JSON array string")

    # Read PDF bytes
    pdf_bytes = await upload.read()
    results = []

    # Extract all PDF text first (for AI analysis)
    all_text = []
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdfdoc:
        for page_num, page in enumerate(pdfdoc.pages, start=1):
            text = page.extract_text() or ""
            all_text.append(f"Page {page_num}:\n{text}")
    full_text = "\n\n".join(all_text)

    # Process queries
    with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdfdoc:
        for page_num, page in enumerate(pdfdoc.pages, start=1):
            text = page.extract_text() or ""

            for query in queries:
                snippets = []
                q_lower = query.lower()
                rationale = "Keyword/Pattern search"

                # 1. Dates
                if "date" in q_lower:
                    rationale = "Date pattern search (regex)"
                    matches = re.finditer(r"\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b", text)
                    for m in matches:
                        snippets.append({
                            "text": m.group(),
                            "page": page_num,
                            "offset": {"start": m.start(), "end": m.end()}
                        })

                # 2. Emails
                elif "email" in q_lower:
                    rationale = "Email address search (regex)"
                    matches = re.finditer(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", text)
                    for m in matches:
                        snippets.append({
                            "text": m.group(),
                            "page": page_num,
                            "offset": {"start": m.start(), "end": m.end()}
                        })

                # 3. Phone numbers
                elif "phone" in q_lower or "mobile" in q_lower or "contact" in q_lower:
                    rationale = "Phone number search (regex)"
                    matches = re.finditer(r"\+?\d{1,3}?[-.\s]??\d{3,5}[-.\s]??\d{5,10}", text)
                    for m in matches:
                        snippets.append({
                            "text": m.group(),
                            "page": page_num,
                            "offset": {"start": m.start(), "end": m.end()}
                        })

                # 4. Generic keyword search
                elif q_lower in text.lower():
                    idx = text.lower().find(q_lower)
                    if idx != -1:
                        snippet = text[idx:idx+80]
                        snippets.append({
                            "text": snippet,
                            "page": page_num,
                            "offset": {"start": idx, "end": idx+len(query)}
                        })

                # 5. If no regex match, fallback to OpenAI NLP
                if not snippets:
                    rationale = "AI-powered semantic search"
                    prompt = f"""
                    You are a helpful AI analyzing a PDF document.

                    Document content:
                    {full_text[:6000]}  # limit for safety

                    Question: {query}

                    Provide a short, clear answer based only on the document.
                    """
                    try:
                        response = client.chat.completions.create(
                            model="gpt-4o-mini",
                            messages=[{"role": "user", "content": prompt}]
                        )
                        ai_answer = response.choices[0].message.content
                        snippets.append({
                            "text": ai_answer,
                            "page": None,
                            "offset": {"start": 0, "end": 0}
                        })
                    except Exception as e:
                        snippets.append({
                            "text": f"AI error: {str(e)}",
                            "page": None,
                            "offset": {"start": 0, "end": 0}
                        })

                # Add to results if any snippets found
                if snippets:
                    results.append({
                        "pointer": query,
                        "snippets": snippets,
                        "rationale": rationale
                    })

    return {"results": results}
