const fs = require("fs");
const asar = require("asar");
const path = require("path");
const diff = require("diff");


module.exports = class {
    /**
     * Constructor for Positron
     * @param asarPackage Package to unpackage
     * @param sourceDir Directory to unpackage asarPackage to
     * @param patchDir Directory to create patches in
     */
    constructor(asarPackage, sourceDir, patchDir) {
        this.package = asarPackage;
        this.sourceDir = sourceDir;
        this.patchDir = patchDir;

        // Get package name
        this.packageName = asarPackage.split("/").pop();
        const nameParts = this.packageName.split(".");
        nameParts.pop();
        this.packageName = nameParts.join(".");

        // Check if asarPackage & directories exist
        if (!fs.existsSync(asarPackage)) throw new Error("asarPackage not found.");
        if (!fs.existsSync(sourceDir)) fs.mkdirSync(sourceDir);
        if (!fs.existsSync(patchDir)) fs.mkdirSync(patchDir);
    }

    /**
     * Unpackages the asar package
     */
    unpackage = () => {
        asar.extractAll(this.package, path.join(__dirname, this.sourceDir, this.packageName));
        asar.extractAll(this.package, path.join(__dirname, this.sourceDir, ".positron", this.packageName));
    }

    /**
     * Creates patches for any modified files
     */
    makePatches = (directory) => {
        const dir = (directory) ? directory : this.sourceDir;
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
            const sourcePath = path.join(dir, file);
            const name = sourcePath.split("/").pop();
            const localDir = sourcePath.slice(this.sourceDir.length)
            const patchPath = path.join(this.patchDir, localDir);

            if (fs.statSync(sourcePath).isDirectory() && !sourcePath.endsWith("node_modules")) {
                if (!fs.existsSync(patchPath)) fs.mkdirSync(patchPath, { recursive: true });
                this.makePatches(sourcePath);
            } else {
                if (!file.endsWith("node_modules")) {
                    console.log("Checking " + sourcePath);
                    fs.readFile(sourcePath, 'utf8',(err, fileData) => {
                        if (err) throw err;
                        fs.readFile(path.join(this.sourceDir, "..", ".positron", localDir), 'utf8', (err, originalData) => {
                            if (err) throw err;
                            const patchData = diff.createPatch(name, fileData, originalData, "", "");
                            const patchFile = patchPath + ".patch";
                            if (patchData.split(/\r\n|\r|\n/).length > 5) {
                                if (fs.existsSync(patchFile)) fs.unlinkSync(patchFile);
                                fs.writeFile(patchFile, patchData, function (err) {
                                    if (err) throw err;
                                    console.log("Created patch: " + patchFile);
                                });
                            } else if (fs.existsSync(patchFile)) fs.unlinkSync(patchFile);
                        });
                    });
                }
            }
        })
    }

    applyPatches = () => {

    }

    package = () => {

    }
}