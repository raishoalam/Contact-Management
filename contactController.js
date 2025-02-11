const Joi = require('joi');
const db = require('./db');

// Joi validation schema
const contactValidationSchema = Joi.object({
  name: Joi.string().min(3).required(),
  email: Joi.string().email().required(),
  phoneNumber: Joi.string().min(10).required(),
  address: Joi.string().optional(),
});

// Create a new contact
exports.createContact = (req, res) => {
  const { error } = contactValidationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, email, phoneNumber, address } = req.body;
  const query = 'INSERT INTO contacts (name, email, phoneNumber, address) VALUES (?, ?, ?, ?)';
  
  db.query(query, [name, email, phoneNumber, address || ''], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error creating contact', error: err });

    const newContact = {
      id: result.insertId,
      name,
      email,
      phoneNumber,
      address,
      createdAt: new Date()
    };
    
    res.status(201).json(newContact);
  });
};

// Get all contacts
exports.getAllContacts = (req, res) => {
  db.query('SELECT * FROM contacts', (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching contacts', error: err });
    res.status(200).json(results);
  });
};

// Get a single contact by ID
exports.getContactById = (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM contacts WHERE id = ?', [id], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error fetching contact', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json(results[0]);
  });
};

// Update a contact by ID
exports.updateContact = (req, res) => {
  const { id } = req.params;
  const { error } = contactValidationSchema.validate(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  const { name, email, phoneNumber, address } = req.body;
  const query = 'UPDATE contacts SET name = ?, email = ?, phoneNumber = ?, address = ? WHERE id = ?';
  
  db.query(query, [name, email, phoneNumber, address || '', id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error updating contact', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json({ message: 'Contact updated successfully' });
  });
};

// Delete a contact by ID
exports.deleteContact = (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM contacts WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Error deleting contact', error: err });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Contact not found' });
    res.status(200).json({ message: 'Contact deleted successfully' });
  });
};
