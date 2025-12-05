cmake_minimum_required(VERSION 3.10)
project(ShortCol2025_Core)

set(CMAKE_CXX_STANDARD 17)

# Thêm thư mục include
include_directories(include)

# Liệt kê source files
file(GLOB_RECURSE SOURCES "src/*.cpp")

# Cấu hình cho Emscripten (WebAssembly)
if(EMSCRIPTEN)
    add_executable(shortcol_core ${SOURCES})
    
    # Flags tối ưu hóa và bind
    set_target_properties(shortcol_core PROPERTIES 
        LINK_FLAGS "-O3 --bind -s MODULARIZE=1 -s EXPORT_NAME='ShortColModule' -s ALLOW_MEMORY_GROWTH=1"
    )
else()
    # Cấu hình cho Desktop test (nếu cần)
    add_executable(shortcol_test ${SOURCES})
endif()