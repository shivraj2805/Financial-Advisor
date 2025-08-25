import React, { useState, useEffect } from 'react';
import { BarChart3, Plus, Upload, History, Home, TrendingUp, Settings, Menu, X } from 'lucide-react';
import NavBar from '../components/NavBar';
import Dashboard from '../components/Dashboard';
import TransactionForm from '../components/TransactionForm';
import ReceiptUpload from '../components/ReceiptUpload';
import TransactionHistory from '../components/TransactionHistory';
import AnalyticsDashboard from '../components/AnalyticsDashboard'; // Added import for AnalyticsDashboard
import api from '../Authorisation/axiosConfig'; // Import configured axios instance

const ExpenseTracker = () => {
    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Add sidebar state

    // Navigation items
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: Home, color: 'text-green-600' },
        { id: 'add', label: 'Add Transaction', icon: Plus, color: 'text-green-600' },
        { id: 'upload', label: 'Upload Receipt', icon: Upload, color: 'text-green-600' },
        { id: 'history', label: 'Transaction History', icon: History, color: 'text-green-600' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, color: 'text-green-600' }
    ];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [transactionsRes, statsRes, categoriesRes] = await Promise.all([
                api.get('/transactions'),
                api.get('/transactions/stats'),
                api.get('/transactions/categories')
            ]);

            if (transactionsRes.data) {
                console.log('🔍 Frontend - Received transactions:', transactionsRes.data);
                if (transactionsRes.data.length > 0) {
                    console.log('🔍 Frontend - First transaction amount:', {
                        amount: transactionsRes.data[0].amount,
                        type: typeof transactionsRes.data[0].amount,
                        text: transactionsRes.data[0].text
                    });
                }
                setTransactions(transactionsRes.data);
            }

            if (statsRes.data) {
                setStats(statsRes.data);
            }

            if (categoriesRes.data) {
                setCategories(categoriesRes.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const addTransaction = async (transactionData) => {
        try {
            console.log('🔍 Frontend - Transaction data before API call:', transactionData);
            
            const response = await api.post('/transactions', {
                ...transactionData,
                source: 'manual'
            });

            console.log('🔍 Frontend - API response:', response.data);

            if (response.data) {
                setTransactions(prev => [response.data, ...prev]);
                
                // Refresh stats
                const statsRes = await api.get('/transactions/stats');
                if (statsRes.data) {
                    setStats(statsRes.data);
                }

                return response.data;
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
            throw error;
        }
    };

    const addReceiptTransaction = async (transactionData) => {
        try {
            const response = await api.post('/transactions/receipt', {
                ...transactionData,
                source: 'receipt'
            });

            if (response.data) {
                setTransactions(prev => [response.data, ...prev]);
                
                // Refresh stats
                const statsRes = await api.get('/transactions/stats');
                if (statsRes.data) {
                    setStats(statsRes.data);
                }

                return response.data;
            }
        } catch (error) {
            console.error('Error adding receipt transaction:', error);
            throw error;
        }
    };

    const addMultipleTransactionsFromReceipt = async (transactionsData) => {
        try {
            const response = await api.post('/transactions/receipt/batch', {
                transactions: transactionsData.map(t => ({
                    ...t,
                    source: 'receipt'
                }))
            });

            if (response.data && response.data.transactions) {
                setTransactions(prev => [...response.data.transactions, ...prev]);
                
                // Refresh stats
                const statsRes = await api.get('/transactions/stats');
                if (statsRes.data) {
                    setStats(statsRes.data);
                }

                return response.data.transactions;
            }
        } catch (error) {
            console.error('Error adding multiple transactions:', error);
            throw error;
        }
    };

    const deleteTransaction = async (id) => {
        try {
            const response = await api.delete(`/transactions/${id}`);

            if (response.data) {
                setTransactions(prev => prev.filter(t => t._id !== id));
                
                // Refresh stats
                const statsRes = await api.get('/transactions/stats');
                if (statsRes.data) {
                    setStats(statsRes.data);
                }
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            throw error;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavBar />
                <div className="flex items-center justify-center h-screen pt-16"> {/* Add pt-16 */}
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <NavBar />
                <div className="flex items-center justify-center h-screen pt-16"> {/* Add pt-16 */}
                    <div className="text-center">
                        <div className="text-red-500 text-6xl mb-4">⚠️</div>
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button
                            onClick={fetchData}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <NavBar />
            
            <div className="flex pt-16 h-screen"> {/* Fixed height container */}
                {/* Mobile Menu Overlay */}
                {sidebarOpen && (
                    <div 
                        className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}

                {/* Sidebar Navigation - Fixed height */}
                <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-sm border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                }`} style={{ top: '64px', height: 'calc(100vh - 64px)' }}>
                    <div className="p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <h1 className="text-xl font-bold text-gray-900">Expense Tracker</h1>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                            >
                                <X className="h-5 w-5 text-gray-600" />
                            </button>
                        </div>
                        <nav className="space-y-2 flex-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeTab === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            setActiveTab(item.id);
                                            setSidebarOpen(false); // Close sidebar on mobile
                                        }}
                                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all ${
                                            isActive
                                                ? 'bg-green-50 border border-green-200 text-green-700'
                                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                    >
                                        <Icon className={`h-5 w-5 ${isActive ? 'text-green-600' : item.color}`} />
                                        <span className="font-medium">{item.label}</span>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Main Content - Scrollable */}
                <div className="flex-1 overflow-hidden">
                    {/* Mobile Header */}
                    <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
                        <h1 className="text-xl font-bold text-gray-900">Expense Tracker</h1>
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 rounded-lg bg-white shadow-sm border border-gray-200"
                        >
                            <Menu className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>

                    {/* Scrollable Content Area */}
                    <div className="h-full overflow-y-auto p-4 lg:p-8">
                        <div className="max-w-7xl mx-auto">
                            {/* Information Banner */}
                            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-blue-800">
                                            Important Information
                                        </h3>
                                        <div className="mt-2 text-sm text-blue-700">
                                            <p>
                                                All transaction amounts are stored exactly as you enter them. 
                                                Percentage calculations shown are for informational purposes only 
                                                and do not affect your actual transaction amounts.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Tab Content */}
                            {activeTab === 'dashboard' && (
                                <Dashboard stats={stats} transactions={transactions} />
                            )}
                            
                            {activeTab === 'add' && (
                                <TransactionForm 
                                    addTransaction={addTransaction} 
                                    categories={categories} 
                                />
                            )}
                            
                            {activeTab === 'upload' && (
                                <ReceiptUpload 
                                    addReceiptTransaction={addReceiptTransaction}
                                    addMultipleTransactionsFromReceipt={addMultipleTransactionsFromReceipt}
                                />
                            )}
                            
                            {activeTab === 'history' && (
                                <TransactionHistory 
                                    transactions={transactions}
                                    onDeleteTransaction={deleteTransaction}
                                    categories={categories}
                                />
                            )}
                            
                            {activeTab === 'analytics' && (
                                <AnalyticsDashboard transactions={transactions} stats={stats} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ExpenseTracker;