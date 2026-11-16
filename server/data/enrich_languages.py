import json
import os

filePath = os.path.join(os.path.dirname(__file__), 'problems.json')
with open(filePath, 'r', encoding='utf-8') as f:
    problems = json.load(f)

for p in problems:
    fn = p.get('functionName', 'solve')
    
    # C++ template
    p['starterCodeCpp'] = f"""#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <unordered_map>
#include <queue>
#include <stack>

using namespace std;

class Solution {{
public:
    // Implement {fn}
    auto {fn}(/* arguments */) {{
        // Write your C++ solution here
    }}
}};
"""

    # JavaScript template
    p['starterCodeJs'] = f"""/**
 * @param {{...*}} args
 * @return {{*}}
 */
var {fn} = function(...args) {{
    // Write your JavaScript solution here
}};
"""

    # Java template
    p['starterCodeJava'] = f"""import java.util.*;

class Solution {{
    // Implement {fn}
    public Object {fn}(/* arguments */) {{
        // Write your Java solution here
        return null;
    }}
}}
"""

with open(filePath, 'w', encoding='utf-8') as f:
    json.dump(problems, f, indent=2)

print(f"Enriched {len(problems)} problems with C++, JavaScript, and Java starter templates!")
