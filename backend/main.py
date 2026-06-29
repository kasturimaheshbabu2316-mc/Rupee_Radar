import os
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from services.parser import parse_and_clean_csv, parse_and_clean_pdf
from services.ai_engine import categorize_transactions, generate_insights
from services.metrics import calculate_metrics

app = FastAPI(title="RupeeRadar API")

frontend_url = os.environ.get("FRONTEND_URL", "*")
origins = [url.strip() for url in frontend_url.split(",")] if frontend_url != "*" else ["*"]

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # In production, restrict this to the frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "RupeeRadar API is running!"}


@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()

    if file.filename.lower().endswith('.csv') or file.filename.lower().endswith('.pdf'):
        try:
            if file.filename.lower().endswith('.csv'):
                df = parse_and_clean_csv(content)
            else:
                df = parse_and_clean_pdf(content)

            # Convert datetime to string for JSON serialization
            df['date'] = df['date'].dt.strftime('%Y-%m-%d')

            # Replace NaN with None for JSON serialization
            df = df.replace({float('nan'): None})

            # Convert to dictionary
            raw_transactions = df.to_dict(orient='records')

            # AI Categorization (Process in batches in production, doing all at once for prototype if small enough)
            # Limit to top 50 transactions to save API tokens during testing if
            # needed
            categorized_transactions = categorize_transactions(
                raw_transactions)

            # Calculate Metrics
            metrics = calculate_metrics(categorized_transactions)

            # Generate AI Insights
            insights = generate_insights(metrics)

            return {
                "filename": file.filename,
                "total_transactions": len(categorized_transactions),
                "metrics": metrics,
                "insights": insights,
                "data": categorized_transactions,
                "status": "success"
            }
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        raise HTTPException(
            status_code=400,
            detail="Only CSV and PDF files are supported in this prototype currently.")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
