import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Ensure GROQ_API_KEY is in your .env or environment variables
client = Groq(api_key=os.environ.get("GROQ_API_KEY", ""))

# Use a standard Groq model, e.g. LLaMA 3
MODEL_NAME = "llama3-8b-8192"

def categorize_transactions(transactions: list, batch_size: int = 50) -> list:
    """
    Takes a list of transaction dicts and adds a 'category' and 'is_recurring' field to each.
    Processes them in batches to avoid LLM token limits and rate limits.
    """
    if not transactions:
        return []
    
    # Pre-fill with defaults in case of LLM failure
    for t in transactions:
        t['category'] = t.get('category', 'Other')
        t['is_recurring'] = t.get('is_recurring', False)

    for i in range(0, len(transactions), batch_size):
        batch = transactions[i:i + batch_size]
        
        # We send a concise JSON representation to the LLM to save tokens and ensure structured output
        # Include date to help with recurring payment detection
        input_data = [{"id": j, "date": t.get('date', ''), "desc": t['description'], "amt": t['amount'], "type": t['type']} for j, t in enumerate(batch)]
        
        prompt = f"""
        You are an expert personal finance assistant. Analyze the following list of bank transactions.
        Categorize each transaction into one of these standard categories:
        Food, Travel, Shopping, Bills, EMI, Subscriptions, Salary, Rent, Investments, Other.
        Also determine if the transaction is likely a recurring payment (e.g., subscription, rent, EMI, salary) based on its description, amount, and date.
        
        Transactions:
        {json.dumps(input_data)}
        
        Respond STRICTLY with a valid JSON array where each object has:
        "id": the transaction id from the input,
        "category": the determined category,
        "is_recurring": boolean
        
        No other text or markdown blocks around the JSON.
        """
        
        try:
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=MODEL_NAME,
            )
            text = response.choices[0].message.content.strip()
            
            # Remove potential markdown formatting if the model disobeys
            if text.startswith("```json"):
                text = text[7:-3]
            elif text.startswith("```"):
                text = text[3:-3]
                
            result_list = json.loads(text.strip())
            
            # Map back to original transactions
            for res in result_list:
                idx = res.get('id')
                if idx is not None and 0 <= idx < len(batch):
                    batch[idx]['category'] = res.get('category', 'Other')
                    batch[idx]['is_recurring'] = res.get('is_recurring', False)
                    
        except Exception as e:
            print(f"Failed to categorize transactions batch via LLM: {e}")
            
    return transactions

def generate_insights(metrics: dict) -> list:
    """
    Generate 3-5 personalized financial insights based on the calculated metrics.
    """
    prompt = f"""
    You are an expert personal finance assistant. Based on the following monthly summary metrics of a user's bank account, generate 3 to 5 clear, personalized financial insights.
    
    Metrics:
    {json.dumps(metrics, indent=2)}
    
    Provide the insights as a clean JSON list of strings. No extra text or markdown formatting.
    Example format: ["Your biggest expense was food.", "You saved 20% of your income."]
    """
    try:
        response = client.chat.completions.create(
            messages=[{"role": "user", "content": prompt}],
            model=MODEL_NAME,
        )
        text = response.choices[0].message.content.strip()
        
        if text.startswith("```json"):
            text = text[7:-3]
        elif text.startswith("```"):
            text = text[3:-3]
            
        insights = json.loads(text.strip())
        return insights
    except Exception as e:
        print(f"Failed to generate insights: {e}")
        return ["Unable to generate insights at this time."]
