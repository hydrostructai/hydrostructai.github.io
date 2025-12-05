---
layout: splash
title: "Engineering Web Applications"
header:
  overlay_color: "#0d6efd"
  overlay_filter: "0.3"
  overlay_image: "/assets/images/hero-engineering.jpg"
  caption: "Professional tools for structural and geotechnical engineers"
author_profile: true
---

<div class="page__hero--overlay">
  <div class="wrapper">
    <h1 class="page__title" style="color: white; text-align: center; margin-bottom: 1rem;">Engineering Web Applications</h1>
    <p class="page__lead" style="color: white; text-align: center; font-size: 1.2rem; max-width: 800px; margin: 0 auto;">
      Advanced finite element analysis tools powered by WebAssembly for structural and geotechnical engineering professionals.
    </p>
  </div>
</div>

<div class="apps-grid-container" style="padding: 4rem 0; background: #f8f9fa;">
  <div class="container" style="max-width: 1200px; margin: 0 auto; padding: 0 1rem;">
    
    <div class="row g-4">
      
      <!-- App 1: Sheet Pile FEM -->
      <div class="col-md-6">
        <div class="app-card">
          <div class="app-card-image">
            <img src="/assets/images/app-icons/sheet pile.png" alt="Sheet Pile FEM" class="img-fluid">
          </div>
          <div class="app-card-body">
            <h3 class="app-card-title">
              <i class="bi bi-diagram-3"></i> Sheet Pile FEM
            </h3>
            <div class="app-card-badges">
              <span class="badge bg-primary">FEM Analysis</span>
              <span class="badge bg-success">WebAssembly</span>
              <span class="badge bg-info">Geotechnical</span>
            </div>
            <p class="app-card-description">
              A powerful Finite Element Method (FEM) tool designed for the analysis and design of sheet pile walls. 
              It supports complex soil-structure interaction, multi-stage excavation, and various anchoring systems 
              (struts, ground anchors). Ideal for deep excavation projects, it provides detailed outputs on wall 
              deflection, bending moments, and soil pressure distribution.
            </p>
            <div class="app-card-features">
              <h6><i class="bi bi-check-circle-fill text-success"></i> Key Features:</h6>
              <ul>
                <li>Multi-stage excavation analysis</li>
                <li>Advanced anchor modeling (elevation, angle, physical properties)</li>
                <li>Soil-structure interaction with multiple soil layers</li>
                <li>Point loads and distributed surcharge support</li>
                <li>Water pressure calculations</li>
                <li>Detailed output: deflection, moments, shear forces</li>
              </ul>
            </div>
            <div class="app-card-footer">
              <a href="/apps/sheetpilefem/" class="btn btn-primary btn-lg w-100">
                <i class="bi bi-play-circle-fill"></i> Launch Application
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <!-- App 2: Pile Group 3D -->
      <div class="col-md-6">
        <div class="app-card">
          <div class="app-card-image">
            <img src="/assets/images/app-icons/pile-group.png" alt="Pile Group 3D" class="img-fluid">
          </div>
          <div class="app-card-body">
            <h3 class="app-card-title">
              <i class="bi bi-grid-3x3-gap-fill"></i> Pile Group 3D
            </h3>
            <div class="app-card-badges">
              <span class="badge bg-primary">3D Analysis</span>
              <span class="badge bg-success">WebAssembly</span>
              <span class="badge bg-warning text-dark">Zavriev-Spiro</span>
            </div>
            <p class="app-card-description">
              A specialized 3D analysis application for pile groups based on the Zavriev-Spiro method. 
              It calculates internal forces and displacements of high-rise building foundations. Features include 
              flexible pile layout definition, interaction with soil layers, and support for both vertical and 
              inclined piles. Perfect for optimizing pile cap designs.
            </p>
            <div class="app-card-features">
              <h6><i class="bi bi-check-circle-fill text-success"></i> Key Features:</h6>
              <ul>
                <li>3D pile group analysis (Zavriev-Spiro method)</li>
                <li>Vertical and inclined pile support</li>
                <li>Flexible pile layout (rectangular, custom configurations)</li>
                <li>Soil layer modeling with spring constants</li>
                <li>Combined loading: axial, shear, moment, torsion</li>
                <li>Pile cap displacement and force distribution</li>
              </ul>
            </div>
            <div class="app-card-footer">
              <a href="/apps/pilegroup/" class="btn btn-primary btn-lg w-100">
                <i class="bi bi-play-circle-fill"></i> Launch Application
              </a>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    
    <!-- Additional Info Section -->
    <div class="row mt-5">
      <div class="col-12">
        <div class="info-box" style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
          <h4 style="color: #0d6efd; margin-bottom: 1rem;">
            <i class="bi bi-info-circle-fill"></i> About These Applications
          </h4>
          <p>
            Both applications utilize <strong>WebAssembly (WASM)</strong> technology, which compiles high-performance 
            C++ finite element analysis code to run directly in your browser. This means:
          </p>
          <div class="row mt-3">
            <div class="col-md-4">
              <div class="info-item">
                <i class="bi bi-lightning-charge-fill text-warning" style="font-size: 2rem;"></i>
                <h6>Lightning Fast</h6>
                <p>Native-speed calculations in your browser</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="info-item">
                <i class="bi bi-shield-fill-check text-success" style="font-size: 2rem;"></i>
                <h6>Private & Secure</h6>
                <p>All data stays on your computer</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="info-item">
                <i class="bi bi-cloud-slash-fill text-primary" style="font-size: 2rem;"></i>
                <h6>Works Offline</h6>
                <p>No server required after initial load</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Other Tools Section -->
    <div class="row mt-5">
      <div class="col-12">
        <h3 style="text-align: center; margin-bottom: 2rem; color: #333;">
          <i class="bi bi-tools"></i> Other Visualization Tools
        </h3>
        <div class="tools-list" style="background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 12px rgba(0,0,0,0.08);">
          <ul style="font-size: 1.1rem; line-height: 2;">
            <li><a href="/tools/circlearea/"><i class="bi bi-circle"></i> Apollonius Circle Area Calculator</a> - Tangent circle visualization</li>
            <li><a href="/tools/hypocycloid/"><i class="bi bi-arrow-repeat"></i> Hypocycloid Visualizer</a> - Mathematical curve animation</li>
            <li><a href="/tools/taylor-series/"><i class="bi bi-graph-up"></i> Taylor Series Approximation</a> - Function approximation demo</li>
            <li><a href="/tools/heartdrawing/"><i class="bi bi-heart-fill"></i> Parametric Heart Curve</a> - Interactive parametric drawing</li>
          </ul>
        </div>
      </div>
    </div>
    
  </div>
</div>

<style>
.app-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.app-card-image {
  width: 100%;
  height: 250px;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.app-card-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.app-card-body {
  padding: 2rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.app-card-title {
  font-size: 1.75rem;
  font-weight: 600;
  color: #212529;
  margin-bottom: 1rem;
}

.app-card-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.app-card-description {
  color: #495057;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  font-size: 1rem;
}

.app-card-features {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.app-card-features h6 {
  margin-bottom: 0.75rem;
  font-weight: 600;
}

.app-card-features ul {
  margin: 0;
  padding-left: 1.25rem;
}

.app-card-features li {
  margin-bottom: 0.5rem;
  color: #495057;
}

.app-card-footer {
  margin-top: auto;
}

.info-item {
  text-align: center;
  padding: 1rem;
}

.info-item h6 {
  margin-top: 0.5rem;
  font-weight: 600;
}

.info-item p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.tools-list ul {
  list-style: none;
  padding: 0;
}

.tools-list li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.tools-list li:last-child {
  border-bottom: none;
}

.tools-list a {
  text-decoration: none;
  color: #0d6efd;
  transition: color 0.2s;
}

.tools-list a:hover {
  color: #0b5ed7;
}

@media (max-width: 768px) {
  .app-card-image {
    height: 200px;
  }
  
  .app-card-title {
    font-size: 1.5rem;
  }
}
</style>