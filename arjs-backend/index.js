const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));

// Route to handle image uploads and generate the .patt file
app.post('/upload', upload.single('image'), (req, res) => {
    const file = req.file;
    const uploadPath = path.join(__dirname, file.path);
    const outputPattPath = path.join(__dirname, 'public', `${file.filename}.patt`);

    // Run the Python script to generate the .patt file
    const command = `python3 generate_marker.py -i ${uploadPath} -o ${outputPattPath}`;

    exec(command, (err, stdout, stderr) => {
        if (err) {
            console.error(`Error generating .patt file: ${stderr}`);
            return res.status(500).json({ error: 'Failed to generate .patt file' });
        }

        // Respond with the .patt file URL
        res.json({
            message: 'File uploaded and .patt generated',
            pattFileUrl: `/public/${file.filename}.patt`
        });

        // Optionally delete the uploaded image after processing
        fs.unlink(uploadPath, (unlinkErr) => {
            if (unlinkErr) console.error(`Error deleting uploaded file: ${unlinkErr}`);
        });
    });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
