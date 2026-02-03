/**
 * APP INPUT & EVENTS MODULE
 * Handles all DOM interaction, input validation, and orchestrates calculation flow
 * Flow: app-inp.js (input) -> app-cal.js (calc) -> app-out.js (display)
 */

/**
 * Main calculation trigger
 * Reads inputs -> Validates -> Calls calc -> Passes to output
 */
function calculateHydraulicJump() {
  try {
    // STEP 1: Read data from HTML inputs
    const Q = parseFloat(document.getElementById("flowRate").value);
    const B = parseFloat(document.getElementById("chuteWidth").value);
    const Z_tl = parseFloat(document.getElementById("upstreamLevel").value);
    const Z_ng = parseFloat(document.getElementById("thresholdLevel").value);
    const Z_dk = parseFloat(document.getElementById("basinBottom").value);
    const h_h = parseFloat(document.getElementById("downstreamDepth").value);
    const phi = parseFloat(document.getElementById("velocityCoeff").value);
    const alpha = parseFloat(document.getElementById("momentumCoeff").value);
    const sigma = parseFloat(document.getElementById("safetyCoeff").value);

    // STEP 2: Validate input
    if (isNaN(Q) || isNaN(B) || Q <= 0 || B <= 0) {
      showAlert("Vui lòng nhập đầy đủ lưu lượng Q và bề rộng B!", "danger");
      return;
    }

    // STEP 3: Create input data object
    const inputData = {
      Q: Q,
      B: B,
      Z_tl: Z_tl,
      Z_ng: Z_ng,
      Z_dk: Z_dk,
      h_h: h_h,
      phi: phi,
      alpha: alpha,
      sigma: sigma,
    };

    // STEP 4: Call pure calculation function from app-cal.js
    const calculationResults = performHydraulicCalculation(inputData);

    // STEP 5: Generate profile data for visualization
    calculationResults.profileData = generateSimplifiedProfile(
      calculationResults,
      inputData
    );

    // STEP 6: Display results using app-out.js
    displayResults(calculationResults);
    displayDetailedResults(calculationResults, inputData);

    // STEP 7: Auto-switch to results tab
    showResultsTab();
  } catch (error) {
    console.error("Lỗi tính toán:", error);
    showAlert(
      "Đã xảy ra lỗi trong quá trình tính toán: " + error.message,
      "danger"
    );
  }
}

/**
 * Display basic results (dashboard-style)
 * Called from app-out.js
 */
function showAlert(message, type) {
  const alertBox = document.getElementById("alertBox");
  const alertClass = `alert alert-${type}`;
  alertBox.innerHTML = `<div class="${alertClass}">${message}</div>`;

  if (typeof showResultsTab === "function") {
    showResultsTab();
  }

  const resultsSection = document.getElementById("resultsSection");
  if (resultsSection) {
    resultsSection.classList.add("show");
    resultsSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }
}

// Auto-calculate on Enter key press
document.addEventListener("DOMContentLoaded", function () {
  const inputs = document.querySelectorAll('input[type="number"]');
  inputs.forEach((input) => {
    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        calculateHydraulicJump();
      }
    });
  });
});

/**
 * Tab switching functionality
 */
function switchTab(tabId) {
  // Remove active class from all tabs and content
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"));

  // Add active class to clicked tab and corresponding content
  const tabBtn = document.querySelector(`[onclick="switchTab('${tabId}')"]`);
  if (tabBtn) {
    tabBtn.classList.add("active");
  }

  const tabContent = document.getElementById(tabId);
  if (tabContent) {
    tabContent.classList.add("active");
  }
}

/**
 * Auto-switch to results tab after successful calculation
 */
function showResultsTab() {
  switchTab("result-sec");
}
