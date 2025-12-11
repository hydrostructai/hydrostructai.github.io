/**
 * App Core Logic - Simplified Version
 * Handles tab switching and basic UI interactions
 * HydroStruct AI - Version 1.0
 */

(function() {
  'use strict';
  
  /**
   * Initialize the application
   */
  function initApp() {
    setupTabSwitching();
    setupMobileMenu();
    setupCalculateButton();
    
    console.log('✓ App initialized successfully');
  }
  
  /**
   * Setup tab switching functionality
   */
  function setupTabSwitching() {
    const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetTab = this.getAttribute('data-tab');
        
        // Remove active class from all buttons and contents
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to clicked button and corresponding content
        this.classList.add('active');
        const targetContent = document.getElementById('tab-' + targetTab);
        if (targetContent) {
          targetContent.classList.add('active');
        }
      });
    });
  }
  
  /**
   * Setup mobile menu toggle
   */
  function setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navbarTabs = document.querySelector('.navbar-tabs');
    
    if (mobileToggle && navbarTabs) {
      mobileToggle.addEventListener('click', function() {
        navbarTabs.classList.toggle('show');
        
        // Toggle icon
        const icon = this.querySelector('i');
        if (icon) {
          icon.classList.toggle('fa-bars');
          icon.classList.toggle('fa-times');
        }
      });
    }
  }
  
  /**
   * Setup calculate button
   * This will call app-specific calculation function if available
   */
  function setupCalculateButton() {
    const calcButton = document.getElementById('btn-calc');
    
    if (calcButton) {
      calcButton.addEventListener('click', function() {
        // Try to call app-specific calculate function
        if (typeof window.calculateApp === 'function') {
          console.log('Running app calculation...');
          window.calculateApp();
          
          // Auto-switch to results tab after calculation
          setTimeout(() => {
            const resultsButton = document.querySelector('.tab-btn[data-tab="results"]');
            if (resultsButton) {
              resultsButton.click();
            }
          }, 500);
        } else {
          console.warn('No calculateApp() function found. Please define it in your app.');
          alert('Chức năng tính toán chưa được cài đặt.');
        }
      });
    }
  }
  
  /**
   * Utility: Show results section
   */
  window.showResults = function() {
    const resultsButton = document.querySelector('.tab-btn[data-tab="results"]');
    if (resultsButton) {
      resultsButton.click();
    }
  };
  
  /**
   * Utility: Clear results
   */
  window.clearResults = function() {
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
      resultsContainer.innerHTML = `
        <div class="empty-results">
          <i class="fas fa-calculator"></i>
          <p>Nhấn "Tính toán" để xem kết quả</p>
        </div>
      `;
    }
  };
  
  /**
   * Utility: Display results (basic)
   */
  window.displayResults = function(html) {
    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
      resultsContainer.innerHTML = html;
    }
    window.showResults();
  };
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
  
})();

