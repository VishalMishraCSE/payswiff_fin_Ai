"""
Quick sanity test for the EasyOCR pipeline.
Usage: python scripts/test_ocr.py <path_to_image>
"""
import sys
import easyocr
import cv2
import numpy as np
import re


def test_ocr(image_path: str):
    print(f"Testing OCR on: {image_path}")

    # 1. Load image
    img = cv2.imread(image_path)
    if img is None:
        print("[ERROR] Could not load image. Check the path.")
        return

    # 2. Check quality
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
    print(f"Blur score (>100 = good quality): {blur_score:.2f}")

    if blur_score < 100:
        print("[WARNING] Image may be too blurry for reliable OCR.")

    # 3. Run OCR
    print("Running EasyOCR (this may take ~30 seconds on CPU)...")
    reader = easyocr.Reader(["en"], gpu=False)
    with open(image_path, "rb") as f:
        results = reader.readtext(f.read(), detail=0)

    full_text = " ".join(results)
    print(f"\nExtracted Text:\n  {full_text}")

    # 4. Parse identity patterns
    pan = re.search(r"\b[A-Z]{5}[0-9]{4}[A-Z]\b", full_text)
    aadhaar = re.search(r"\b[2-9]\d{3}\s\d{4}\s\d{4}\b", full_text)

    if pan:
        print(f"\n✅ PAN Card Detected: {pan.group(0)}")
    elif aadhaar:
        print(f"\n✅ Aadhaar Card Detected: {aadhaar.group(0)}")
    else:
        print("\n⚠ No known ID pattern found.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/test_ocr.py <path_to_image>")
        sys.exit(1)
    test_ocr(sys.argv[1])
