const modelRows = document.getElementById('modelRows');
const modelRowTemplate = document.getElementById('modelRowTemplate');
const refreshButton = document.getElementById('refreshModels');
const chatModelSelect = document.getElementById('chatModel');
const formTitle = document.getElementById('formTitle');
const modelForm = document.getElementById('modelForm');
const cancelEdit = document.getElementById('cancelEdit');
const transcript = document.getElementById('transcript');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const modelIdInput = document.getElementById('modelId');
const modelNameInput = document.getElementById('modelName');
const modelDescriptionInput = document.getElementById('modelDescription');
const modelEndpointInput = document.getElementById('modelEndpoint');

let models = [];
let editingId = null;

async function fetchModels() {
  const response = await fetch('/api/models');
  models = await response.json();
  renderModels();
  populateDropdown();
}

function renderModels() {
  modelRows.innerHTML = '';
  models.forEach((model) => {
    const clone = modelRowTemplate.content.cloneNode(true);
    clone.querySelector('.model-name').textContent = model.name;
    clone.querySelector('.model-description').textContent = model.description;
    clone.querySelector('.model-endpoint').textContent = model.endpointUrl;

    const editButton = clone.querySelector('.edit');
    const deleteButton = clone.querySelector('.delete');

    editButton.addEventListener('click', () => beginEdit(model));
    deleteButton.addEventListener('click', () => removeModel(model.id));

    modelRows.appendChild(clone);
  });
}

function populateDropdown() {
  chatModelSelect.innerHTML = '';
  models.forEach((model) => {
    const option = document.createElement('option');
    option.value = model.id;
    option.textContent = model.name;
    chatModelSelect.appendChild(option);
  });
}

async function removeModel(id) {
  if (!confirm('Delete this model?')) return;

  const response = await fetch(`/api/models/${id}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    models = models.filter((model) => model.id !== id);
    renderModels();
    populateDropdown();
  } else {
    alert('Unable to delete model.');
  }
}

function resetForm() {
  editingId = null;
  formTitle.textContent = 'Add new model';
  modelForm.reset();
  modelIdInput.value = '';
}

function beginEdit(model) {
  editingId = model.id;
  formTitle.textContent = 'Edit model';
  modelIdInput.value = model.id;
  modelNameInput.value = model.name;
  modelDescriptionInput.value = model.description;
  modelEndpointInput.value = model.endpointUrl;
}

modelForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    id: modelIdInput.value || undefined,
    name: modelNameInput.value,
    description: modelDescriptionInput.value,
    endpointUrl: modelEndpointInput.value
  };

  const method = editingId ? 'PUT' : 'POST';
  const url = editingId ? `/api/models/${editingId}` : '/api/models';

  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await response.json();
    alert(error.message || 'Unable to save model');
    return;
  }

  const model = await response.json();

  if (editingId) {
    models = models.map((entry) => (entry.id === editingId ? model : entry));
  } else {
    models.push(model);
  }

  resetForm();
  renderModels();
  populateDropdown();
});

cancelEdit.addEventListener('click', resetForm);
refreshButton.addEventListener('click', fetchModels);

chatForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = messageInput.value.trim();
  const modelId = chatModelSelect.value;
  if (!message) return;

  addMessage('You', message);
  messageInput.value = '';
  messageInput.focus();

  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, modelId })
  });

  const reply = await response.json();
  if (!response.ok) {
    addMessage('System', reply.message || 'Error contacting model.');
    return;
  }

  addMessage(reply.model.name, reply.reply);
});

function addMessage(author, text) {
  const container = document.createElement('div');
  container.className = 'message';

  const authorLabel = document.createElement('div');
  authorLabel.className = 'author';
  authorLabel.textContent = author;

  const content = document.createElement('div');
  content.textContent = text;

  container.append(authorLabel, content);
  transcript.appendChild(container);
  transcript.scrollTop = transcript.scrollHeight;
}

fetchModels();
