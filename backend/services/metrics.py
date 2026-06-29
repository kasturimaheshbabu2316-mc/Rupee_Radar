import pandas as pd

def calculate_metrics(transactions: list) -> dict:
    """
    Takes a list of transaction dictionaries (with category) and returns aggregated metrics.
    """
    if not transactions:
        return {}
        
    df = pd.DataFrame(transactions)
    
    metrics = {}
    
    # Total Income and Spend
    metrics['total_income'] = float(df[df['type'] == 'credit']['amount'].sum())
    metrics['total_spend'] = float(df[df['type'] == 'debit']['amount'].sum())
    metrics['savings'] = metrics['total_income'] - metrics['total_spend']
    
    # Top Categories (excluding Income/Salary)
    spend_df = df[df['type'] == 'debit']
    if not spend_df.empty and 'category' in spend_df.columns:
        cat_group = spend_df.groupby('category')['amount'].sum().sort_values(ascending=False)
        metrics['top_categories'] = cat_group.head(5).to_dict()
    else:
        metrics['top_categories'] = {}
        
    # Biggest Transactions
    if not spend_df.empty:
        biggest = spend_df.nlargest(3, 'amount')
        metrics['biggest_transactions'] = biggest[['description', 'amount', 'date']].to_dict(orient='records')
    else:
        metrics['biggest_transactions'] = []
        
    # Recurring summary
    if 'is_recurring' in df.columns:
        recurring_df = spend_df[spend_df['is_recurring'] == True]
        metrics['total_recurring_spend'] = float(recurring_df['amount'].sum())
    else:
        metrics['total_recurring_spend'] = 0.0
        
    return metrics
