# RupeeRadar: Edge Cases & Corner Cases

This document outlines potential edge cases and corner cases for the RupeeRadar application, derived from the system architecture and implementation plan. Addressing these scenarios is critical for building a robust, production-ready system.

## 1. Data Ingestion & Parsing (Backend)

*   **Non-Standard Headers:** Bank statements from different banks use wildly different column names (e.g., "Withdrawal Amount (INR)" instead of "Debit"). The parser might fail to identify the amount or date columns.
*   **Corrupted or Empty Files:** Uploading a CSV that is empty, contains only headers, or is improperly formatted (e.g., incorrect delimiters).
*   **Multi-line Descriptions:** CSV rows where the transaction description contains newline characters (`\n`), which can break standard CSV parsers if not properly quoted.
*   **Number Formatting:** Handling different regional number formats (e.g., Indian `1,00,000.00` vs. US `100,000.00` vs. European `100.000,00`).
*   **Date Formats:** Dates appearing in ambiguous formats (e.g., `04-05-2023` – is it April 5th or May 4th?).
*   **Password Protected PDFs:** If PDF support is added, the system must gracefully handle password-protected statements and prompt the user.

## 2. AI / LLM Processing

*   **API Rate Limits & Downtime:** The external LLM provider (Gemini/OpenAI) may rate-limit requests, timeout, or experience downtime. The application needs a fallback mechanism (e.g., default categorization to "Other").
*   **Token Context Limits:** A user might upload a statement with 5,000+ transactions, exceeding the LLM's maximum token context window. Transactions must be chunked and processed in batches.
*   **LLM Hallucinations (Invalid JSON):** The LLM might ignore the strict JSON output prompt and return conversational text or malformed JSON, which would crash the backend JSON parser.
*   **Unusual Descriptions:** Highly cryptic or internal banking codes (e.g., "ACH/12999X/REV") where the LLM struggles to accurately determine the category.

## 3. Metrics Calculation & Insights

*   **Zero Income or Zero Spend:** A statement covering a period with absolutely no income or no expenses. This can cause divide-by-zero errors when calculating savings percentages or break pie chart rendering.
*   **Negative Amounts in Unexpected Columns:** Some banks represent refunds as negative debits rather than credits. The calculation logic needs to account for this to avoid misrepresenting total spend.
*   **Extremely Large Values:** Transactions with massive amounts (e.g., transferring life savings to a new account) might skew the insights and top categories, hiding everyday spending habits.

## 4. Frontend & User Interface

*   **Large File Uploads:** Uploading a 50MB CSV file could freeze the browser during the file reading phase or exceed the backend server's maximum payload limit (e.g., FastAPI/Uvicorn default limits).
*   **Long Loading Times:** LLM processing for hundreds of transactions can take 10-30 seconds. The UI must handle network timeouts gracefully and provide engaging loading indicators to prevent user abandonment.
*   **UI Overflow:** Extremely long transaction descriptions (e.g., NEFT transfer notes) breaking the table layout on mobile screens.

## 5. Security & Privacy

*   **CSV Injection (Formula Injection):** Maliciously crafted CSV files containing Excel formulas (e.g., `=CMD|' /C calc'!A0`) that could be dangerous if the user exports the cleaned data back to Excel.
*   **PII Leakage:** Statements containing full account numbers, PAN cards, or phone numbers in the description. Sending this raw data to a third-party LLM poses a privacy risk. PII masking should be considered before the LLM step.
