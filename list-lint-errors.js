const fs = require("fs");
let data;
try {
  data = fs.readFileSync("eslint.json", "utf16le");
  if (data.charCodeAt(0) === 0xfeff) {
    data = data.slice(1);
  }
} catch (e) {
  try {
    data = fs.readFileSync("eslint.json", "utf8");
  } catch (e) {
    console.log("Could not read file");
    process.exit(1);
  }
}
try {
  const json = JSON.parse(data);
  let problemCount = 0;
  json.forEach((file) => {
    if (file.errorCount > 0 || file.warningCount > 0) {
      console.log(`\n${file.filePath}`);
      file.messages.forEach((msg) => {
        console.log(
          `  ${msg.line}:${msg.column}  ${msg.severity === 2 ? "error" : "warning"}  ${msg.message}  ${msg.ruleId}`,
        );
      });
      problemCount += file.errorCount + file.warningCount;
    }
  });
  console.log(`\nTotal problems: ${problemCount}`);
} catch (e) {
  console.log("Error parsing JSON:", e.message);
}
