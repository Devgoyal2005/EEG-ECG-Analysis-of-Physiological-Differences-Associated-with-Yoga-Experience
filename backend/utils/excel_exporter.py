import os
from pathlib import Path
from typing import Dict, Any, List, Union
import pandas as pd
from utils.config import RESULTS_DIR

def export_dict_to_excel(
    sheets_data: Dict[str, Union[pd.DataFrame, List[Dict[str, Any]]]],
    filename: str,
    output_dir: Path = RESULTS_DIR
) -> Path:
    """
    Exports multiple DataFrames or list of dicts to a single Excel workbook
    with multiple sheets.
    """
    output_dir.mkdir(parents=True, exist_ok=True)
    file_path = output_dir / filename
    
    with pd.ExcelWriter(str(file_path), engine="openpyxl") as writer:
        for sheet_name, data in sheets_data.items():
            # Truncate sheet name to 31 chars (Excel limit)
            clean_sheet_name = sheet_name[:31]
            if isinstance(data, list):
                df = pd.DataFrame(data)
            elif isinstance(data, pd.DataFrame):
                df = data
            else:
                df = pd.DataFrame([data])
                
            df.to_excel(writer, sheet_name=clean_sheet_name, index=False)
            
    print(f"Exported Excel report successfully to: {file_path}")
    return file_path


def read_excel_sheets(filename: str, input_dir: Path = RESULTS_DIR) -> Dict[str, List[Dict[str, Any]]]:
    """
    Reads all sheets from an Excel file and returns them as a dictionary of record lists.
    """
    file_path = input_dir / filename
    if not file_path.exists():
        return {}
    
    excel_file = pd.ExcelFile(str(file_path))
    results = {}
    for sheet in excel_file.sheet_names:
        df = pd.read_excel(excel_file, sheet_name=sheet)
        # Replace NaN with None for valid JSON serialization
        df = df.where(pd.notnull(df), None)
        results[sheet] = df.to_dict(orient="records")
    return results
