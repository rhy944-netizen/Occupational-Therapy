const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
const path = require('path');

// सर्वर को बताओ कि सारी फाइलें (CSS, JS, Images) यहीं बाहर रखी हैं
app.use(express.static(__dirname));

// जब कोई तुम्हारा मेन लिंक खोले, तो उसे index.html दिखाओ
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose.connect(config.MONGODB_URI)
    .then(() => console.log('MongoDB Connected Successfully'))
    .catch(err => console.log('DB Connection Error: ', err));

// Database Schema & Model
const EnquirySchema = new mongoose.Schema({
    parentName: { type: String, required: true },
    childName: String,
    childAge: Number,
    phone: { type: String, required: true },
    email: String,
    therapy: String,
    message: String,
    date: { type: Date, default: Date.now }
});

const Enquiry = mongoose.model('Enquiry', EnquirySchema);

// 1. Nodemailer Transporter Setup (Gmail ke liye)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.ADMIN_EMAIL, // Yeh config.js se aapka email uthaega
        pass: 'wophpghqovnwxesq' // Yahan apna 16-digit ka Google App Password daalein
    }
});

// API Routes
app.post('/api/contact', async (req, res) => {
    try {
        // Pehle data ko MongoDB me save karein
        const newEnquiry = new Enquiry(req.body);
        await newEnquiry.save();

        // 2. Email ka content design karein
        const mailOptions = {
            from: req.body.email || config.ADMIN_EMAIL,
            to: config.ADMIN_EMAIL, // Jis email par aapko message chahiye
            subject: `New Session Booking from ${req.body.parentName}`,
            text: `
                New Enquiry Details:
                ---------------------------------
                Parent Name: ${req.body.parentName}
                Child Name: ${req.body.childName || 'N/A'}
                Child Age: ${req.body.childAge || 'N/A'}
                Phone Number: ${req.body.phone}
                Email: ${req.body.email || 'N/A'}
                Required Therapy: ${req.body.therapy}
                Message: ${req.body.message || 'N/A'}
                ---------------------------------
            `
        };

        // 3. Email Bheinjee (Background me chalega)
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log('Email Sending Error: ', err);
            } else {
                console.log('Email Sent Successfully: ', info.response);
            }
        });

        res.status(201).json({ success: true, message: 'Aapki enquiry successfully save aur send ho gayi hai!' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server me kuch dikkat hai.' });
    }
});

// Admin: Get all enquiries
app.get('/api/admin/enquiries', async (req, res) => {
    try {
        const enquiries = await Enquiry.find().sort({ date: -1 });
        res.status(200).json(enquiries);
    } catch (error) {
        res.status(500).json({ error: 'Data load nahi ho saka' });
    }
});

// Admin: Delete enquiry
app.delete('/api/admin/enquiries/:id', async (req, res) => {
    try {
        await Enquiry.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: 'Enquiry deleted' });
    } catch (error) {
        console.log("अरे बाप रे, ये एरर है:", error);
        res.status(500).json({ error: 'Deletion failed' });
    }
});

// Server Initialization
app.listen(config.PORT, () => {
    console.log(`Server running on http://localhost:${config.PORT}`);
});
