const TypeRegistry = require('../typeRegistry');

class JavascriptGenerator {
    static generate(metadata, testcaseInput, userCode) {
        let code = userCode + '\n\n';

        // Variables
        const args = [];
        for (const param of metadata.parameters) {
            const literal = TypeRegistry.getLiteral('javascript', param.type, testcaseInput[param.name]);
            code += `const ${param.name} = ${literal};\n`;
            args.push(param.name);
        }

        // Call user function
        code += `\nconst sol = new Solution();\n`;
        code += `const result = sol.${metadata.functionName}(${args.join(', ')});\n`;
        code += `console.log(JSON.stringify(result));\n`;

        return code;
    }
}

module.exports = JavascriptGenerator;
