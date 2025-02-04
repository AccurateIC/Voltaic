import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/propertyDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error(err));

const propertySchema = new mongoose.Schema({
    propertyID: { type: String, required: true, unique: true }, 
    propertyName: { type: String, required: true },
    propertyUnit: { type: String, required: true }
});

const Property = mongoose.model('Property', propertySchema);


app.post('/properties', async (req, res) => {
    try {
        const property = new Property(req.body);
        const savedProperty = await property.save();
        res.status(201).json(savedProperty);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.get('/properties', async (req, res) => {
    try {
        const properties = await Property.find();
        res.status(200).json(properties);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.get('/properties/:id', async (req, res) => {
    try {
        const property = await Property.findOne({ propertyID: req.params.id });
        if (!property) return res.status(404).json({ message: 'Property not found' });
        res.status(200).json(property);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.put('/properties/:id', async (req, res) => {
    try {
        const updatedProperty = await Property.findOneAndUpdate(
            { propertyID: req.params.id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedProperty) return res.status(404).json({ message: 'Property not found' });
        res.status(200).json(updatedProperty);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.delete('/properties/:id', async (req, res) => {
    try {
        const deletedProperty = await Property.findOneAndDelete({ propertyID: req.params.id });
        if (!deletedProperty) return res.status(404).json({ message: 'Property not found' });
        res.status(200).json({ message: 'Property deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
