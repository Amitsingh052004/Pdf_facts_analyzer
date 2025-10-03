# 📄 PDF Facts Analyzer

A web-based tool to analyze PDF documents.  
Upload a PDF and extract key information such as dates, emails, phone numbers, or custom queries.  
Integrated with OpenAI NLP (optional) for natural language understanding.

---

## 🚀 Features
- Upload and analyze PDFs via web interface
- Extract dates, emails, phone numbers using regex
- Search for custom keywords
- AI-powered query handling (via OpenAI API)

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/pdf-facts-analyzer.git
cd pdf-facts-analyzer

2. Backend (FastAPI)
Create Virtual Environment
cd backend
python -m venv venv
venv\Scripts\activate      # Windows

Install Dependencies
pip install -r requirements.txt


Setup Environment Variables

Create a .env file inside the backend/ folder:

OPENAI_API_KEY=your_api_key_here


Run Backend
uvicorn main:app --reload


Backend will start at:
👉 http://127.0.0.1:8000

3. Frontend (Next.js)
Install Dependencies
cd frontend
npm install

Run Frontend
npm run dev


Frontend will start at:
👉 http://localhost:3000
