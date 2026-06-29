import { FileFolder } from "../models/fileFolder.model.js";

import fs from "fs/promises";
import os from "os";
import path from "path";

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const runFile = async (req, res) => {
  try {
    const projectId = req.project._id;
    const { fileId } = req.params;
    const { input = "" } = req.body;

    const file = await FileFolder.findOne({
      _id: fileId,
      project: projectId,
      type: "file",
    });

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "codesync-"));

    let filePath = "";
    let command = "";

    const escapedInput = input
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\n/g, "\\n");

    switch (file.language) {
      case "python":
        filePath = path.join(tempDir, "main.py");

        await fs.writeFile(filePath, file.content || "");

        command = `printf "%b" "${escapedInput}" | python3 "${filePath}"`;
        break;

      case "javascript":
        filePath = path.join(tempDir, "main.js");

        await fs.writeFile(filePath, file.content || "");

        command = `printf "%b" "${escapedInput}" | node "${filePath}"`;
        break;

      case "cpp":
        filePath = path.join(tempDir, "main.cpp");

        await fs.writeFile(filePath, file.content || "");

        command = `g++ "${filePath}" -o "${tempDir}/program" && printf "%b" "${escapedInput}" | "${tempDir}/program"`;
        break;

      case "java":
        filePath = path.join(tempDir, "Main.java");

        await fs.writeFile(filePath, file.content || "");

        command = `cd "${tempDir}" && javac Main.java && printf "%b" "${escapedInput}" | java Main`;
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Unsupported language",
        });
    }

    const { stdout, stderr } = await execAsync(command);

    await fs.rm(tempDir, { recursive: true, force: true });

    return res.status(200).json({
      success: true,
      output: stdout || stderr || "Program finished.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.stderr || error.message,
    });
  }
};
