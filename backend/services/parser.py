"""
Parser module for extracting and cleaning bank statement data from CSV and PDF files.
"""
import io
import pandas as pd

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

def parse_and_clean_csv(file_content: bytes) -> pd.DataFrame:
    """
    Parses a CSV bank statement and normalizes it.
    This expects columns like Date, Description, Amount (or Debit/Credit).
    """
    try:
        # Load the CSV
        df = pd.read_csv(io.BytesIO(file_content))

        # We need to standardize column names. Since bank statements vary wildly,
        # we do some basic heuristics.
        # Standard columns we want: ['date', 'description', 'amount', 'type']

        # Convert all columns to lowercase for easier matching
        df.columns = df.columns.str.lower().str.strip()

        # Rename common columns
        col_mapping = {
            'txn date': 'date',
            'transaction date': 'date',
            'value date': 'date',
            'particulars': 'description',
            'narration': 'description',
            'remarks': 'description',
            'withdrawal': 'debit',
            'deposit': 'credit',
            'dr': 'debit',
            'cr': 'credit'
        }
        df.rename(columns=col_mapping, inplace=True)

        # Ensure we have date and description
        if 'date' not in df.columns:
            # try to find a date column
            for col in df.columns:
                if 'date' in col:
                    df.rename(columns={col: 'date'}, inplace=True)
                    break

        if 'description' not in df.columns:
            for col in df.columns:
                if 'desc' in col or 'detail' in col or 'particular' in col:
                    df.rename(columns={col: 'description'}, inplace=True)
                    break

        # Handle Amount vs Debit/Credit
        if 'amount' in df.columns:
            # If we just have amount, we need to infer type if it's negative
            df['amount'] = pd.to_numeric(
                df['amount'].astype(str).str.replace(
                    ',', ''), errors='coerce')
            if 'type' not in df.columns:
                df['type'] = df['amount'].apply(
                    lambda x: 'debit' if x < 0 else 'credit')
            df['amount'] = df['amount'].abs()
        elif 'debit' in df.columns and 'credit' in df.columns:
            # Clean numeric values
            df['debit'] = pd.to_numeric(
                df['debit'].astype(str).str.replace(
                    ',', ''), errors='coerce').fillna(0)
            df['credit'] = pd.to_numeric(
                df['credit'].astype(str).str.replace(
                    ',', ''), errors='coerce').fillna(0)

            # Create standard amount and type
            def get_amount_type(row):
                if row['credit'] > 0:
                    return pd.Series([row['credit'], 'credit'])
                return pd.Series([row['debit'], 'debit'])

            df[['amount', 'type']] = df.apply(get_amount_type, axis=1)
        else:
            raise ValueError(
                "Could not find Amount or Debit/Credit columns in the CSV.")

        # Clean description
        df['description'] = df['description'].astype(str).str.strip()

        # Drop rows where amount is 0 or NaN, or description is missing
        df = df.dropna(subset=['amount', 'description', 'date'])
        df = df[df['amount'] > 0]

        # Select final columns
        final_cols = ['date', 'description', 'amount', 'type']

        # Try to parse date
        df['date'] = pd.to_datetime(df['date'], errors='coerce', dayfirst=True)

        return df[final_cols].reset_index(drop=True)

    except Exception as e:
        raise ValueError(f"Failed to parse CSV: {str(e)}") from e


# pylint: disable=too-many-locals,too-many-branches
def parse_and_clean_pdf(file_content: bytes) -> pd.DataFrame:
    """
    Parses a PDF bank statement using pdfplumber.
    Extracts tabular data and converts it into a DataFrame for cleaning.
    """

    if pdfplumber is None:
        raise ImportError("pdfplumber is not installed.")

    try:
        all_rows = []
        with pdfplumber.open(io.BytesIO(file_content)) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        # Clean out None values
                        clean_row = [
                            str(cell).strip() if cell is not None else "" for cell in row]
                        # Only keep rows that have some data
                        if any(clean_row):
                            all_rows.append(clean_row)

        if not all_rows:
            raise ValueError("No tabular data found in the PDF.")

        # Try to identify the header row
        # Usually, headers contain 'Date', 'Amount', etc.
        header_idx = 0
        for i, row in enumerate(all_rows[:15]):
            row_str = " ".join(row).lower()
            if 'date' in row_str and (
                    'amount' in row_str or 'debit' in row_str or 'credit' in row_str):
                header_idx = i
                break

        headers = all_rows[header_idx]
        data = all_rows[header_idx + 1:]

        # Ensure headers are unique
        clean_headers = []
        for i, h in enumerate(headers):
            h_clean = h.lower().strip()
            if not h_clean:
                h_clean = f"unnamed_{i}"
            clean_headers.append(h_clean)

        # Create DataFrame
        # Sometimes rows might have fewer/more columns than headers due to bad extraction
        # We'll just truncate or pad
        padded_data = []
        for row in data:
            if len(row) < len(clean_headers):
                row.extend([""] * (len(clean_headers) - len(row)))
            elif len(row) > len(clean_headers):
                row = row[:len(clean_headers)]
            padded_data.append(row)

        df = pd.DataFrame(padded_data, columns=clean_headers)

        # Now convert it to CSV string and pass it to parse_and_clean_csv to
        # reuse the logic
        csv_buffer = io.StringIO()
        df.to_csv(csv_buffer, index=False)
        return parse_and_clean_csv(csv_buffer.getvalue().encode('utf-8'))

    except Exception as e:
        raise ValueError(f"Failed to parse PDF: {str(e)}") from e
