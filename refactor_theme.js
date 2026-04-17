const fs = require('fs');
const path = require('path');

const replacements = [
  { regex: /bg-dark-950/g, replacement: "bg-slate-50" },
  { regex: /bg-dark-900/g, replacement: "bg-white" },
  { regex: /bg-dark-800/g, replacement: "bg-white" },
  { regex: /bg-dark-700/g, replacement: "bg-slate-100" },
  { regex: /bg-dark-600/g, replacement: "bg-slate-200" },
  { regex: /bg-dark-500/g, replacement: "bg-slate-300" },
  { regex: /border-dark-800/g, replacement: "border-slate-200" },
  { regex: /border-dark-700/g, replacement: "border-slate-300" },
  { regex: /border-dark-600/g, replacement: "border-slate-300" },
  { regex: /border-dark-500/g, replacement: "border-slate-400" },
  { regex: /text-dark-950/g, replacement: "text-white" },
  { regex: /text-dark-900/g, replacement: "text-slate-50" },
  { regex: /text-dark-800/g, replacement: "text-slate-100" },
  { regex: /text-dark-700/g, replacement: "text-slate-200" },
  { regex: /text-dark-600/g, replacement: "text-slate-400" },
  { regex: /text-dark-500/g, replacement: "text-slate-500" },
  { regex: /text-dark-400/g, replacement: "text-slate-600" },
  { regex: /text-dark-300/g, replacement: "text-slate-700" },
  { regex: /text-dark-200/g, replacement: "text-slate-800" },
  { regex: /text-dark-100/g, replacement: "text-slate-900" },
  { regex: /text-white/g, replacement: "text-slate-900" },
  { regex: /hover:bg-dark-900/g, replacement: "hover:bg-slate-50" },
  { regex: /hover:bg-dark-800/g, replacement: "hover:bg-slate-50" },
  { regex: /hover:bg-dark-700/g, replacement: "hover:bg-slate-100" },
  { regex: /hover:bg-dark-600/g, replacement: "hover:bg-slate-200" },
  { regex: /hover:border-dark-700/g, replacement: "hover:border-slate-300" },
  { regex: /hover:border-dark-500/g, replacement: "hover:border-slate-400" },
  { regex: /hover:text-white/g, replacement: "hover:text-slate-900" },
  { regex: /placeholder-dark-500/g, replacement: "placeholder-slate-400" },
  { regex: /placeholder-dark-400/g, replacement: "placeholder-slate-400" },
  
  // Specific element box states
  { regex: /bg-green-950\/40/g, replacement: "bg-green-50" },
  { regex: /bg-green-950\/50/g, replacement: "bg-green-50" },
  { regex: /bg-green-950\/60/g, replacement: "bg-green-50" },
  { regex: /bg-green-950/g, replacement: "bg-green-50" },
  { regex: /border-green-900\/60/g, replacement: "border-green-200" },
  { regex: /border-green-900\/50/g, replacement: "border-green-200" },
  { regex: /hover:bg-green-900\/40/g, replacement: "hover:bg-green-100" },
  { regex: /hover:border-green-600/g, replacement: "hover:border-green-400" },
  { regex: /text-green-300/g, replacement: "text-green-600" },
  { regex: /text-green-400/g, replacement: "text-green-600" },
  { regex: /text-green-200/g, replacement: "text-green-700" },
  
  { regex: /bg-amber-950\/40/g, replacement: "bg-amber-50" },
  { regex: /bg-amber-950\/60/g, replacement: "bg-amber-50" },
  { regex: /bg-amber-950/g, replacement: "bg-amber-50" },
  { regex: /border-amber-900\/60/g, replacement: "border-amber-200" },
  { regex: /border-amber-900\/50/g, replacement: "border-amber-200" },
  { regex: /hover:border-amber-500/g, replacement: "hover:border-amber-400" },
  { regex: /hover:border-amber-600/g, replacement: "hover:border-amber-400" },
  { regex: /hover:bg-amber-900\/40/g, replacement: "hover:bg-amber-100" },
  { regex: /text-amber-300/g, replacement: "text-amber-600" },
  { regex: /text-amber-400/g, replacement: "text-amber-600" },
  { regex: /text-amber-200/g, replacement: "text-amber-700" },

  { regex: /bg-red-950\/40/g, replacement: "bg-red-50" },
  { regex: /bg-red-950\/50/g, replacement: "bg-red-50" },
  { regex: /bg-red-950\/60/g, replacement: "bg-red-50" },
  { regex: /bg-red-950/g, replacement: "bg-red-50" },
  { regex: /border-red-900\/60/g, replacement: "border-red-200" },
  { regex: /border-red-900\/50/g, replacement: "border-red-200" },
  { regex: /border-red-900\/40/g, replacement: "border-red-200" },
  { regex: /hover:border-red-600/g, replacement: "hover:border-red-400" },
  { regex: /hover:bg-red-900\/40/g, replacement: "hover:bg-red-100" },
  { regex: /text-red-300/g, replacement: "text-red-600" },
  { regex: /text-red-400/g, replacement: "text-red-600" },
  { regex: /text-red-200/g, replacement: "text-red-700" },
  
  { regex: /bg-brand-950\/30/g, replacement: "bg-brand-50" },
  { regex: /bg-brand-900\/30/g, replacement: "bg-brand-100" },
  { regex: /text-brand-300/g, replacement: "text-brand-700" },
  { regex: /text-brand-400/g, replacement: "text-brand-600" },
];

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // skip config
      if (file === "tailwind.config.ts") continue;

      let changed = false;
      for (const rule of replacements) {
        if (rule.regex.test(content)) {
          content = content.replace(rule.regex, rule.replacement);
          changed = true;
        }
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log("Updated", fullPath);
      }
    }
  }
}

processDir('./app');
processDir('./components');
