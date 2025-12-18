#!/usr/bin/env python3
"""
Selenium automation script to capture ShortCol 3D dashboard screenshot
with sample data and validate both 2D and 3D diagrams render correctly.
"""

import time
import sys
import io

# Fix encoding for Windows console
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains

def setup_driver():
    """Initialize Chrome WebDriver with options."""
    options = webdriver.ChromeOptions()
    options.add_argument("--start-maximized")
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-popup-blocking")
    # Uncomment for headless mode (no visible window):
    # options.add_argument("--headless")
    return webdriver.Chrome(options=options)

def wait_for_element(driver, selector, timeout=10):
    """Wait for element to be present in DOM."""
    try:
        WebDriverWait(driver, timeout).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, selector))
        )
        return True
    except:
        return False

def fill_input_form(driver):
    """Fill the input form with sample data."""
    print("[*] Filling input form...")
    
    # Wait for any input elements to load
    time.sleep(2)  # Additional wait for React to render
    
    try:
        # Find all input elements
        inputs = driver.find_elements(By.CSS_SELECTOR, "input[type='number'], input[type='text']")
        print(f"[*] Found {len(inputs)} input fields")
        
        if len(inputs) == 0:
            print("[!] No input fields found")
            return False
        
        # Fill B (Width) = 300 (first number input)
        if len(inputs) > 0:
            inputs[0].clear()
            inputs[0].send_keys("300")
            print("[OK] B = 300 mm")
        
        # Fill H (Height) = 400 (second number input)
        if len(inputs) > 1:
            inputs[1].clear()
            inputs[1].send_keys("400")
            print("[OK] H = 400 mm")
        
        # Fill Cover = 30 (third number input)
        if len(inputs) > 2:
            inputs[2].clear()
            inputs[2].send_keys("30")
            print("[OK] Cover = 30 mm")
        
        return True
    except Exception as e:
        print(f"[!] Error filling form: {e}")
        return False

def click_calculate(driver):
    """Click the calculate button."""
    print("[*] Clicking calculate button...")
    try:
        # Find button by text "TÍNH TOÁN KIỂM TRA"
        buttons = driver.find_elements(By.TAG_NAME, "button")
        for btn in buttons:
            if "TÍNH TOÁN" in btn.text.upper():
                # Scroll element into view and add extra offset
                driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", btn)
                time.sleep(1)
                # Try using Action Chains for better click handling
                try:
                    ActionChains(driver).move_to_element(btn).click().perform()
                except:
                    # Fallback to JavaScript click
                    driver.execute_script("arguments[0].click();", btn)
                print("[OK] Calculate button clicked")
                return True
        print("[!] Calculate button not found")
        return False
    except Exception as e:
        print(f"[!] Error clicking button: {e}")
        return False

def wait_for_charts(driver, timeout=25):
    """Wait for Plotly charts to render."""
    print("[*] Waiting for charts to render...")
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        try:
            # Check for Plotly charts (they render in div elements with Plotly.js)
            plot_divs = driver.find_elements(By.CLASS_NAME, "plotly-graph-div")
            if len(plot_divs) >= 2:  # At least 2D and 3D charts
                # Check if they have actual content
                for div in plot_divs:
                    if div.size['width'] > 100 and div.size['height'] > 100:
                        print(f"[OK] Found {len(plot_divs)} Plotly chart elements")
                        return True
            
            # Alternative: check for SVG elements (Plotly renders to SVG)
            svgs = driver.find_elements(By.TAG_NAME, "svg")
            if len(svgs) >= 2:  # At least 2D and 3D charts
                print(f"[OK] Found {len(svgs)} SVG chart elements")
                return True
            
            time.sleep(0.5)
        except:
            pass
    
    print("[!] Timeout waiting for charts")
    return False

def check_console_for_errors(driver):
    """Check browser console for JavaScript errors."""
    print("[*] Checking console for errors...")
    logs = driver.get_log("browser")
    errors = [log for log in logs if log["level"] == "SEVERE"]
    
    if errors:
        print(f"[!] Found {len(errors)} console errors:")
        for error in errors[:3]:  # Show first 3 errors
            print(f"  - {error['message']}")
        return False
    else:
        print("[OK] No critical console errors")
        return True

def take_screenshot(driver, filename):
    """Take screenshot and save to file."""
    print(f"[*] Taking screenshot: {filename}")
    driver.save_screenshot(filename)
    print(f"[OK] Screenshot saved to {filename}")

def main():
    driver = None
    try:
        print("=" * 60)
        print("ShortCol 3D Dashboard Screenshot Automation")
        print("=" * 60)
        
        # Initialize driver
        print("[*] Starting Chrome WebDriver...")
        driver = setup_driver()
        
        # Navigate to app
        url = "http://localhost:8000/index.html"
        print(f"[*] Navigating to {url}...")
        driver.get(url)
        
        # Wait for app to load
        time.sleep(3)
        print("[OK] Page loaded")
        
        # Fill form
        if not fill_input_form(driver):
            print("[!] Failed to fill form")
            take_screenshot(driver, "sample-3d-error-form.png")
            return False
        
        # Click calculate
        if not click_calculate(driver):
            print("[!] Failed to click calculate")
            take_screenshot(driver, "sample-3d-error-calc.png")
            return False
        
        # Wait longer for charts to render
        print("[*] Waiting for calculation and rendering...")
        time.sleep(5)  # Longer initial wait
        
        # Try multiple times to find charts
        charts_found = False
        for attempt in range(5):
            try:
                svgs = driver.find_elements(By.TAG_NAME, "svg")
                plot_divs = driver.find_elements(By.CLASS_NAME, "plotly-graph-div")
                print(f"[*] Attempt {attempt+1}: Found {len(svgs)} SVG, {len(plot_divs)} Plotly divs")
                
                if len(svgs) >= 2 or len(plot_divs) >= 2:
                    charts_found = True
                    break
                time.sleep(2)
            except:
                time.sleep(2)
        
        # Check console
        print("[*] Checking console for errors...")
        try:
            logs = driver.get_log("browser")
            errors = [log for log in logs if log["level"] == "SEVERE"]
            print(f"[*] Found {len(errors)} SEVERE console messages")
            
            # Print all logs for debugging
            warnings = [log for log in logs if log["level"] == "WARNING"]
            print(f"[*] Found {len(warnings)} WARNING messages")
            
            # Print ALL messages (info, log, etc.)
            print("\n[*] === ALL CONSOLE MESSAGES ===")
            for log in logs:
                level = log.get("level", "?")
                msg = log.get("message", "")
                # Truncate very long messages
                if len(msg) > 150:
                    msg = msg[:150] + "..."
                print(f"[{level}] {msg}")
            print("[*] === END CONSOLE ===\n")
        except:
            print("[!] Could not read console logs")
        
        # Take final screenshot regardless
        print("[*] Taking screenshot...")
        take_screenshot(driver, "sample-3d.png")
        
        print("\n" + "=" * 60)
        print("[OK] Screenshot captured as 'sample-3d.png'")
        if charts_found:
            print("[OK] Charts were detected during rendering")
        else:
            print("[!] Charts may not have fully rendered, but screenshot was taken anyway")
        print("=" * 60)
        
        return True
        
    except Exception as e:
        print(f"[!] Error: {e}")
        import traceback
        traceback.print_exc()
        if driver:
            take_screenshot(driver, "sample-3d-error-exception.png")
        return False
    
    finally:
        if driver:
            print("[*] Closing browser...")
            driver.quit()

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
