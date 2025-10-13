# Rolevate CV Filler Agent - Examples

This directory contains example files demonstrating how to use the CV Filler Agent.

## Files

### sample_cv.json
A complete example of structured CV data in JSON format. You can use this as a template for creating your own CV data or for testing the agent.

## Usage Examples

### 1. Extract data from CV file
```bash
python cli.py extract --input examples/my_cv.pdf --output examples/extracted_data.json
```

### 2. Fill template with sample data
```bash
python cli.py fill --data examples/sample_cv.json --template modern --format pdf --output john_doe_cv.pdf
```

### 3. Complete processing pipeline
```bash
python cli.py process --input examples/my_cv.pdf --template professional --format docx
```

### 4. Using the API

Start the server:
```bash
python cli.py serve
```

Then use curl or any HTTP client:

```bash
# Extract CV data
curl -X POST "http://localhost:8000/api/v1/cv/extract" \
  -F "file=@examples/my_cv.pdf"

# Process complete CV
curl -X POST "http://localhost:8000/api/v1/cv/process" \
  -F "file=@examples/my_cv.pdf" \
  -F "template_name=modern" \
  -F "output_format=pdf"
```

## Creating Your Own CV JSON

Use the `sample_cv.json` as a template. The required fields are:
- `full_name` (required)
- Other fields are optional but recommended for better results

## Tips

1. **Better Extraction**: Use enhance flag (`--enhance`) for AI-improved data
2. **Template Preview**: Use the `/api/v1/cv/preview` endpoint to preview before generating
3. **Batch Processing**: Create a script to process multiple CVs at once
