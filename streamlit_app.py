import sys
import os
import streamlit as st
import pandas as pd
from typing import Dict, Any

from backend.services.parser import parse_and_clean_csv, parse_and_clean_pdf
from backend.services.ai_engine import categorize_transactions, generate_insights
from backend.services.metrics import calculate_metrics

st.set_page_config(page_title="RupeeRadar Dashboard", page_icon="💸", layout="wide")

st.title("💸 RupeeRadar: AI-Powered Personal Finance")
st.markdown("Upload your bank statement (CSV or PDF) to automatically categorize transactions, view spending insights, and identify recurring payments.")

uploaded_file = st.file_uploader("Choose a bank statement", type=["csv", "pdf"])

if uploaded_file is not None:
    with st.spinner("Processing your statement..."):
        try:
            content = uploaded_file.getvalue()
            
            if uploaded_file.name.lower().endswith('.csv'):
                df = parse_and_clean_csv(content)
            else:
                df = parse_and_clean_pdf(content)

            df['date'] = df['date'].dt.strftime('%Y-%m-%d')
            df = df.replace({float('nan'): None})
            
            raw_transactions = df.to_dict(orient='records')
            
            categorized_transactions = categorize_transactions(raw_transactions)
            metrics = calculate_metrics(categorized_transactions)
            insights = generate_insights(metrics)
            
            st.success("Statement processed successfully!")

            # Top Level Metrics
            st.header("Financial Overview")
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Total Income", f"₹{metrics['total_income']:,.2f}")
            with col2:
                st.metric("Total Spending", f"₹{metrics['total_spend']:,.2f}")
            with col3:
                savings = metrics['total_income'] - metrics['total_spend']
                st.metric("Net Savings", f"₹{savings:,.2f}")

            # Insights
            st.header("AI Insights")
            if isinstance(insights, list):
                for insight in insights:
                    st.info(f"💡 {insight}")
            else:
                st.write(insights)

            # Top Categories
            st.header("Spending by Category")
            if metrics.get("category_spend"):
                cat_df = pd.DataFrame(list(metrics["category_spend"].items()), columns=["Category", "Amount"])
                cat_df = cat_df.sort_values(by="Amount", ascending=False).reset_index(drop=True)
                st.bar_chart(cat_df, x="Category", y="Amount")
                
                # Show top 5 as a small table
                st.table(cat_df.head(5))

            # Transactions Table
            st.header("Categorized Transactions")
            trans_df = pd.DataFrame(categorized_transactions)
            # Reorder columns for better viewing
            cols = ['date', 'description', 'amount', 'type', 'category', 'is_recurring']
            # Only keep columns that exist
            cols = [c for c in cols if c in trans_df.columns]
            st.dataframe(trans_df[cols], use_container_width=True)

        except Exception as e:
            st.error(f"An error occurred: {str(e)}")
