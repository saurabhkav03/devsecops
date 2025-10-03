import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Configure axios defaults
axios.defaults.baseURL = API_BASE_URL;

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Auth state
  const [isLogin, setIsLogin] = useState(true);
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    username: ''
  });

  // Task state
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    tags: ''
  });

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    priority: ''
  });

  // Check for existing token on app load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUserProfile();
      fetchTasks();
    }
  }, []);

  // Fetch tasks when page or filters change
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [currentPage, filters, user]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/api/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Profile fetch failed:', error);
      logout();
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 5,
        ...filters
      };
      
      const response = await axios.get('/api/tasks', { params });
      setTasks(response.data.tasks);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      setError('Failed to fetch tasks');
      console.error('Tasks fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { email: authForm.email, password: authForm.password }
        : authForm;

      const response = await axios.post(endpoint, payload);
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setUser(user);
      setAuthForm({ email: '', password: '', username: '' });
      setCurrentPage(1);
      
      await fetchTasks();
    } catch (error) {
      setError(error.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setTasks([]);
    setCurrentPage(1);
    setTotalPages(1);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const taskData = {
        ...taskForm,
        tags: taskForm.tags ? taskForm.tags.split(',').map(tag => tag.trim()) : [],
        dueDate: taskForm.dueDate ? new Date(taskForm.dueDate).toISOString() : undefined
      };

      const response = await axios.post('/api/tasks', taskData);
      setTasks([response.data, ...tasks.slice(0, 4)]); // Keep pagination
      setTaskForm({ title: '', description: '', priority: 'medium', dueDate: '', tags: '' });
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    try {
      const response = await axios.put(`/api/tasks/${taskId}`, updates);
      setTasks(tasks.map(task => 
        task._id === taskId ? response.data : task
      ));
    } catch (error) {
      setError('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error) {
      setError('Failed to delete task');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'in-progress': return '#2196F3';
      default: return '#FF9800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      default: return '#4caf50';
    }
  };

  if (!user) {
    return (
      <div className="app">
        <div className="auth-container">
          <div className="auth-header">
            <h1>DevSecOps Task Manager</h1>
            <p>Secure, Scalable, Simple</p>
          </div>
          
          <div className="auth-toggle">
            <button 
              className={isLogin ? 'active' : ''}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button 
              className={!isLogin ? 'active' : ''}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuth} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                  required
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="Enter email"
                value={authForm.email}
                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                required
              />
            </div>
            
            <button type="submit" disabled={loading} className="auth-btn">
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Task Manager</h1>
          <div className="user-info">
            <span className="welcome-text">Welcome, {user.username}!</span>
            <span className="user-role">({user.role})</span>
            <button onClick={logout} className="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="content-grid">
          <div className="sidebar">
            <div className="create-task-section">
              <h2>Create New Task</h2>
              <form onSubmit={handleCreateTask} className="task-form">
                <div className="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    placeholder="Task title"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({...taskForm, title: e.target.value})}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    placeholder="Task description"
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({...taskForm, description: e.target.value})}
                    rows="3"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Priority</label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) => setTaskForm({...taskForm, priority: e.target.value})}
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>Due Date</label>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({...taskForm, dueDate: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="urgent, work, personal"
                    value={taskForm.tags}
                    onChange={(e) => setTaskForm({...taskForm, tags: e.target.value})}
                  />
                </div>
                
                <button type="submit" disabled={loading} className="create-btn">
                  {loading ? 'Creating...' : 'Create Task'}
                </button>
              </form>
            </div>

            <div className="filters-section">
              <h3>Filters</h3>
              <div className="filter-group">
                <label>Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="filter-group">
                <label>Priority</label>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({...filters, priority: e.target.value})}
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="tasks-section">
            <div className="tasks-header">
              <h2>Your Tasks</h2>
              {loading && <div className="loading-spinner">Loading...</div>}
            </div>
            
            {tasks.length === 0 && !loading ? (
              <div className="no-tasks">
                <p>No tasks found. Create your first task!</p>
              </div>
            ) : (
              <>
                <div className="tasks-grid">
                  {tasks.map(task => (
                    <div key={task._id} className="task-card">
                      <div className="task-header">
                        <h3>{task.title}</h3>
                        <div className="task-badges">
                          <span 
                            className="priority-badge"
                            style={{ backgroundColor: getPriorityColor(task.priority) }}
                          >
                            {task.priority}
                          </span>
                          <span 
                            className="status-badge"
                            style={{ backgroundColor: getStatusColor(task.status) }}
                          >
                            {task.status}
                          </span>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="task-description">{task.description}</p>
                      )}
                      
                      {task.dueDate && (
                        <div className="task-due-date">
                          Due: {formatDate(task.dueDate)}
                        </div>
                      )}
                      
                      {task.tags && task.tags.length > 0 && (
                        <div className="task-tags">
                          {task.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))}
                        </div>
                      )}
                      
                      <div className="task-actions">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateTask(task._id, { status: e.target.value })}
                          className="status-select"
                        >
                          <option value="pending">Pending</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                        </select>
                        
                        <button
                          onClick={() => handleDeleteTask(task._id)}
                          className="delete-btn"
                          title="Delete task"
                        >
                          🗑️
                        </button>
                      </div>
                      
                      <div className="task-meta">
                        <small>Created: {formatDate(task.createdAt)}</small>
                        {task.updatedAt !== task.createdAt && (
                          <small>Updated: {formatDate(task.updatedAt)}</small>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="page-btn"
                    >
                      Previous
                    </button>
                    
                    <span className="page-info">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="page-btn"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <span>{error}</span>
            <button onClick={() => setError('')}>×</button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;

