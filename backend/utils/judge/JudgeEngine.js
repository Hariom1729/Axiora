// backend/utils/judge/JudgeEngine.js
const CppGenerator = require('./generators/CppGenerator');
const JavascriptGenerator = require('./generators/JavascriptGenerator');

class JudgeEngine {
    static generate(language, metadata, testcaseInput, userCode) {
        if (language === 'cpp' || language === 'c++') {
            return CppGenerator.generate(metadata, testcaseInput, userCode);
        }
        if (language === 'javascript') {
            return JavascriptGenerator.generate(metadata, testcaseInput, userCode);
        }
        
        throw new Error(`Language not supported by Judge Engine yet: ${language}`);
    }
}

module.exports = JudgeEngine;
