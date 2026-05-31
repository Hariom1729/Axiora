// backend/utils/judge/generators/CppGenerator.js
const TypeRegistry = require('../typeRegistry');

class CppGenerator {
    static generate(metadata, testcaseInput, userCode) {
        let code = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
using namespace std;

${this._getHelperFunctions()}

${userCode}

int main() {
`;

        // 1. Inject Variables
        for (const param of metadata.parameters) {
            const literal = TypeRegistry.getLiteral('cpp', param.type, testcaseInput[param.name]);
            if (param.type === 'ListNode*') {
                code += `    vector<int> _vec_${param.name} = ${literal};\n`;
                code += `    ListNode* ${param.name} = buildList(_vec_${param.name});\n`;
            } else if (param.type === 'TreeNode*') {
                code += `    // TreeNode parsing logic would go here\n`;
                code += `    TreeNode* ${param.name} = nullptr;\n`;
            } else {
                code += `    ${param.type} ${param.name} = ${literal};\n`;
            }
        }

        // 2. Invoke Solution
        code += `\n    Solution sol;\n`;
        const args = metadata.parameters.map(p => p.name).join(', ');
        
        if (metadata.returnType !== 'void') {
            code += `    auto result = sol.${metadata.functionName}(${args});\n`;
            code += `    cout << serialize(result) << endl;\n`;
        } else {
            code += `    sol.${metadata.functionName}(${args});\n`;
            // If return type is void, usually we serialize one of the modified parameters.
            // For now, if void, print nothing, or we can handle it later.
            code += `    cout << "null" << endl;\n`;
        }

        code += `\n    return 0;\n}\n`;
        return code;
    }

    static _getHelperFunctions() {
        return `
// --- Boilerplate Serializers ---
string serialize(int v) { return to_string(v); }
string serialize(long long v) { return to_string(v); }
string serialize(double v) { return to_string(v); }
string serialize(bool v) { return v ? "true" : "false"; }
string serialize(string v) { return "\\"" + v + "\\""; }

template<typename T>
string serialize(const vector<T>& v) {
    string res = "[";
    for(size_t i = 0; i < v.size(); i++) {
        res += serialize(v[i]);
        if(i != v.size() - 1) res += ",";
    }
    res += "]";
    return res;
}

template<typename T>
string serialize(const vector<vector<T>>& v) {
    string res = "[";
    for(size_t i = 0; i < v.size(); i++) {
        res += serialize(v[i]);
        if(i != v.size() - 1) res += ",";
    }
    res += "]";
    return res;
}

// List/Tree structures
struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

ListNode* buildList(const vector<int>& v) {
    if(v.empty()) return nullptr;
    ListNode* head = new ListNode(v[0]);
    ListNode* curr = head;
    for(size_t i=1; i<v.size(); i++){
        curr->next = new ListNode(v[i]);
        curr = curr->next;
    }
    return head;
}

string serialize(ListNode* head) {
    string res = "[";
    while(head) {
        res += to_string(head->val);
        head = head->next;
        if(head) res += ",";
    }
    res += "]";
    return res;
}

// TreeNode definition could be added here
`;
    }
}

module.exports = CppGenerator;
