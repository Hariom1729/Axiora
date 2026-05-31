// backend/utils/judge/typeRegistry.js

class TypeRegistry {
    static getLiteral(language, type, value) {
        if (language === 'cpp') {
            return this._getCppLiteral(type, value);
        }
        if (language === 'python') {
            return this._getPythonLiteral(type, value);
        }
        if (language === 'java') {
            return this._getJavaLiteral(type, value);
        }
        if (language === 'javascript') {
            return this._getJavascriptLiteral(type, value);
        }
        throw new Error(`Unsupported language: ${language}`);
    }

    static _getCppLiteral(type, value) {
        switch (type) {
            case 'int':
            case 'long long':
            case 'double':
                return `${value}`;
            case 'bool':
                return value ? 'true' : 'false';
            case 'string':
                return `"${value}"`;
            case 'char':
                return `'${value}'`;
            case 'vector<int>':
            case 'vector<long long>':
            case 'vector<double>':
                return `{${value.join(', ')}}`;
            case 'vector<string>':
                return `{${value.map(v => `"${v}"`).join(', ')}}`;
            case 'vector<vector<int>>':
                return `{${value.map(arr => `{${arr.join(', ')}}`).join(', ')}}`;
            case 'ListNode*':
                // For ListNode*, we generate a helper function in CppGenerator that converts a vector to a linked list.
                // Here we just return the literal representation of the vector.
                return `{${value.join(', ')}}`;
            case 'TreeNode*':
                return `{${value.map(v => v === null ? 'null' : v).join(', ')}}`;
            default:
                throw new Error(`Unsupported type for cpp literal: ${type}`);
        }
    }

    static _getPythonLiteral(type, value) {
        if (type === 'string') return `"${value}"`;
        if (type === 'bool') return value ? 'True' : 'False';
        return JSON.stringify(value);
    }

    static _getJavaLiteral(type, value) {
        // Similar mappings for Java
        switch (type) {
            case 'int': return `${value}`;
            case 'boolean': return value ? 'true' : 'false';
            case 'String': return `"${value}"`;
            case 'int[]': return `new int[]{${value.join(', ')}}`;
            case 'String[]': return `new String[]{${value.map(v => `"${v}"`).join(', ')}}`;
            default: return JSON.stringify(value);
        }
    }

    static _getJavascriptLiteral(type, value) {
        return JSON.stringify(value);
    }
}

module.exports = TypeRegistry;
