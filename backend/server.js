const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminCategoryRoutes = require('./routes/adminCategoryRoutes');
const articleRoutes = require('./routes/articleRoutes');
const adminArticleRoutes = require('./routes/adminArticleRoutes');
const preferenceRoutes = require('./routes/preferenceRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL 
    ? [process.env.FRONTEND_URL, 'http://localhost:5173']
    : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Portal Berita API berjalan!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin/categories', adminCategoryRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/admin/articles', adminArticleRoutes);
app.use('/api/preferences', preferenceRoutes);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});