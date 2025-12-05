#include emscriptenbind.h
#include ....includecoreMaterials.h
#include ....includecoreSection.h
#include ....includeanalysisColumnAnalyzer.h
#include ....includecodesACI318_25.h
#include ....includecodesTCVN5574_2018.h
#include ....includecodesEurocode2.h

using namespace emscripten;
using namespace ShortCol2025Core;
using namespace ShortCol2025Codes;
using namespace ShortCol2025Analysis;

 Binding code
EMSCRIPTEN_BINDINGS(shortcol_module) {
    
     1. Enums
    enum_SectionShape(SectionShape)
        .value(RECTANGULAR, SectionShapeRECTANGULAR)
        .value(CIRCULAR, SectionShapeCIRCULAR);

     2. Structs
    value_objectConcreteProp(ConcreteProp)
        .field(fc, &ConcretePropfc)
        .field(ec_max, &ConcretePropec_max)
        .field(Ec, &ConcretePropEc);

    value_objectSteelProp(SteelProp)
        .field(fy, &SteelPropfy)
        .field(Es, &SteelPropEs)
        .field(ey, &SteelPropey);

    value_objectSectionGeometry(SectionGeometry)
        .field(shape, &SectionGeometryshape)
        .field(width, &SectionGeometrywidth)
        .field(height, &SectionGeometryheight)
        .field(cover, &SectionGeometrycover);

    value_objectRebar(Rebar)
        .field(x, &Rebarx)
        .field(y, &Rebary)
        .field(area, &Rebararea)
        .field(diameter, &Rebardiameter);

    value_objectAnalysisResult(AnalysisResult)
        .field(Pn, &AnalysisResultPn)
        .field(Mn, &AnalysisResultMn)
        .field(Phi, &AnalysisResultPhi)
        .field(phiPn, &AnalysisResultphiPn)
        .field(phiMn, &AnalysisResultphiMn)
        .field(c, &AnalysisResultc);

     3. Classes (Standards)
    class_DesignStandard(DesignStandard)
        .function(getName, &DesignStandardgetName)
        .allow_subclassDesignStandardWrapper(DesignStandardWrapper);

    class_ACI318_25, baseDesignStandard(ACI318_25)
        .constructor();

    class_TCVN5574_2018, baseDesignStandard(TCVN5574_2018)
        .constructor();

    class_Eurocode2, baseDesignStandard(Eurocode2)
        .constructor();

     4. Main Analyzer
    class_ColumnAnalyzer(ColumnAnalyzer)
        .constructorConcreteProp, SteelProp, SectionGeometry, const DesignStandard()
        .function(addRebar, &ColumnAnalyzeraddRebar)
        .function(clearRebars, &ColumnAnalyzerclearRebars)
        .function(calculateSectionForces, &ColumnAnalyzercalculateSectionForces)
        .function(generateInteractionDiagram, &ColumnAnalyzergenerateInteractionDiagram)
        .function(solveNeutralAxisForLoad, &ColumnAnalyzersolveNeutralAxisForLoad)
         Cho phép dùng raw pointer trong constructor
        .allow_raw_pointers();
        
     Register vectors
    register_vectorAnalysisResult(VectorAnalysisResult);
}