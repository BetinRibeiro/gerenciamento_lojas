
        document.addEventListener('DOMContentLoaded', function() {
            // DOM Elements
            const commerceContainer = document.getElementById('commerce-container');
            const commerceModal = document.getElementById('commerce-modal');
            const closeModalBtn = document.getElementById('close-modal-btn');
            const addCommerceBtn = document.getElementById('add-commerce-btn');
            const addCommerceModal = document.getElementById('add-commerce-modal');
            const closeAddCommerceModal = document.getElementById('close-add-commerce-modal');
            const addCommerceForm = document.getElementById('add-commerce-form');
            const prevMonthBtn = document.getElementById('prev-month-btn');
            const nextMonthBtn = document.getElementById('next-month-btn');
            const currentMonthDisplay = document.getElementById('current-month');
            const transactionForm = document.getElementById('transaction-form');
            const transactionsList = document.getElementById('transactions-list');
            const totalRevenueDisplay = document.getElementById('total-revenue');
            const contributionMarginDisplay = document.getElementById('contribution-margin');
            const netProfitDisplay = document.getElementById('net-profit');
            const transactionCount = document.getElementById('transaction-count');
            const exportBtn = document.getElementById('export-btn');
            const importBtn = document.getElementById('import-btn');
            const fileInput = document.getElementById('file-input');
            
            // State variables
            let currentCommerceId = null;
            let currentDate = new Date();
            let currentMonth = currentDate.getMonth();
            let currentYear = currentDate.getFullYear();
            
            // Initialize the app
            initApp();
            
            function initApp() {
                loadCommerces();
                setupEventListeners();
                // Set today's date as default in transaction form
                document.getElementById('transaction-date').valueAsDate = new Date();
            }
            
            function setupEventListeners() {
                // Commerce modal
                closeModalBtn.addEventListener('click', closeCommerceModal);
                
                // Add commerce modal
                addCommerceBtn.addEventListener('click', () => {
                    addCommerceModal.classList.remove('hidden');
                });
                
                closeAddCommerceModal.addEventListener('click', () => {
                    addCommerceModal.classList.add('hidden');
                });
                
                addCommerceForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    addCommerce();
                });
                
                // Month navigation
                prevMonthBtn.addEventListener('click', () => {
                    navigateMonth(-1);
                });
                
                nextMonthBtn.addEventListener('click', () => {
                    navigateMonth(1);
                });
                
                // Transaction form
                transactionForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    addTransaction();
                });
                
                // Import/Export buttons
                exportBtn.addEventListener('click', exportData);
                importBtn.addEventListener('click', () => {
                    fileInput.click();
                });
                
                fileInput.addEventListener('change', importData);
            }
            
            // Format currency
            function formatCurrency(value) {
                return new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }).format(value);
            }
            
            // Format percentage
            function formatPercentage(value) {
                return new Intl.NumberFormat('pt-BR', {
                    style: 'percent',
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1
                }).format(value);
            }
            
            // Get month name
            function getMonthName(monthIndex) {
                const months = [
                    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
                ];
                return months[monthIndex];
            }
            
            // LocalStorage helpers
            function getCommerces() {
                const commerces = localStorage.getItem('commerces');
                return commerces ? JSON.parse(commerces) : [];
            }
            
            function saveCommerces(commerces) {
                localStorage.setItem('commerces', JSON.stringify(commerces));
            }
            
            function getTransactions() {
                const transactions = localStorage.getItem('transactions');
                return transactions ? JSON.parse(transactions) : [];
            }
            
            function saveTransactions(transactions) {
                localStorage.setItem('transactions', JSON.stringify(transactions));
            }
            
            // Export data to JSON file
            function exportData() {
                const commerces = getCommerces();
                const transactions = getTransactions();
                
                if (commerces.length === 0 && transactions.length === 0) {
                    showNotification('Não há dados para exportar.', 'error');
                    return;
                }
                
                const data = {
                    commerces,
                    transactions,
                    exportedAt: new Date().toISOString()
                };
                
                const jsonData = JSON.stringify(data, null, 2);
                const blob = new Blob([jsonData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                
                const a = document.createElement('a');
                a.href = url;
                a.download = `dados_comercios_${new Date().toISOString().slice(0, 10)}.txt`;
                document.body.appendChild(a);
                a.click();
                
                // Clean up
                setTimeout(() => {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 100);
                
                // Show success notification
                showNotification('Dados exportados com sucesso!', 'success');
            }
            
            // Import data from JSON file
            function importData(event) {
                const file = event.target.files[0];
                if (!file) return;
                
                if (!file.name.endsWith('.txt')) {
                    showNotification('Por favor, selecione um arquivo .txt válido.', 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = JSON.parse(e.target.result);
                        
                        if (!data.commerces || !data.transactions) {
                            throw new Error('Formato de arquivo inválido');
                        }
                        
                        // Ask for confirmation before overwriting data
                        if (!confirm('Isso substituirá todos os dados atuais. Deseja continuar?')) {
                            return;
                        }
                        
                        // Save imported data
                        saveCommerces(data.commerces);
                        saveTransactions(data.transactions);
                        
                        // Reload the app
                        loadCommerces();
                        
                        // Close modal if open
                        closeCommerceModal();
                        
                        // Show success notification
                        showNotification('Dados importados com sucesso!', 'success');
                    } catch (error) {
                        console.error('Erro ao importar dados:', error);
                        showNotification('Erro ao importar dados. Verifique se o arquivo está no formato correto.', 'error');
                    }
                };
                
                reader.readAsText(file);
                // Reset file input
                event.target.value = '';
            }
            
            // Show notification
            function showNotification(message, type) {
                // Remove existing notifications
                const existingNotifications = document.querySelectorAll('.notification');
                existingNotifications.forEach(notification => notification.remove());
                
                const notification = document.createElement('div');
                notification.className = `notification fade-in`;
                
                if (type === 'success') {
                    notification.classList.add('notification-success');
                } else if (type === 'error') {
                    notification.classList.add('notification-error');
                } else {
                    notification.classList.add('notification-info');
                }
                
                notification.innerHTML = `
                    <div class="flex items-center">
                        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'} mr-2"></i>
                        <span>${message}</span>
                    </div>
                `;
                
                document.body.appendChild(notification);
                
                // Auto-remove after 3 seconds
                setTimeout(() => {
                    notification.classList.add('fade-out');
                    setTimeout(() => {
                        notification.remove();
                    }, 300);
                }, 3000);
            }
            
            // Commerce functions
            function loadCommerces() {
                commerceContainer.innerHTML = '';
                const commerces = getCommerces();
                
                if (commerces.length === 0) {
                    commerceContainer.innerHTML = `
                        <div class="col-span-full text-center py-12">
                            <div class="inline-block bg-gray-100 p-6 rounded-full mb-4">
                                <i class="fas fa-store text-4xl text-gray-300"></i>
                            </div>
                            <p class="text-gray-500 mb-2">Nenhum comércio cadastrado ainda.</p>
                            <p class="text-gray-400 text-sm mb-4">Adicione seu primeiro comércio para começar</p>
                            <button id="add-first-commerce" class="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-4 py-2 rounded-lg shadow-md">
                                <i class="fas fa-plus mr-2"></i> Adicionar Primeiro Comércio
                            </button>
                        </div>
                    `;
                    
                    document.getElementById('add-first-commerce').addEventListener('click', () => {
                        addCommerceModal.classList.remove('hidden');
                    });
                    return;
                }
                
                commerces.forEach(commerce => {
                    const commerceCard = document.createElement('div');
                    commerceCard.className = 'bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer relative commerce-card';
                    commerceCard.innerHTML = `
                        <div class="p-5">
                            <div class="flex justify-between items-start">
                                <h3 class="text-xl font-semibold text-gray-800 mb-2">${commerce.name}</h3>
                                <div class="commerce-actions">
                                    <button class="delete-commerce-btn text-gray-400 hover:text-red-500 p-1" data-id="${commerce.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="grid grid-cols-2 gap-2 mt-4">
                                <div>
                                    <p class="text-sm text-gray-500">Custo Variável</p>
                                    <p class="font-medium">${commerce.costPercentage}%</p>
                                </div>
                                <div>
                                    <p class="text-sm text-gray-500">Comissão</p>
                                    <p class="font-medium">${commerce.commissionPercentage}%</p>
                                </div>
                            </div>
                        </div>
                        <div class="bg-gray-50 px-5 py-3 border-t border-gray-200">
                            <div class="flex justify-between items-center">
                                <span class="text-sm text-gray-500">Última atualização</span>
                                <span class="text-sm text-gray-500">${new Date().toLocaleDateString()}</span>
                            </div>
                        </div>
                    `;
                    
                    commerceCard.addEventListener('click', () => {
                        openCommerceModal(commerce.id);
                    });
                    
                    const deleteBtn = commerceCard.querySelector('.delete-commerce-btn');
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteCommerce(commerce.id);
                    });
                    
                    commerceContainer.appendChild(commerceCard);
                });
            }
            
            function addCommerce() {
                const name = document.getElementById('commerce-name').value;
                const costPercentage = parseFloat(document.getElementById('variable-cost').value);
                const commissionPercentage = parseFloat(document.getElementById('commission-rate').value);
                
                if (!name || isNaN(costPercentage) || isNaN(commissionPercentage)) {
                    showNotification('Por favor, preencha todos os campos corretamente.', 'error');
                    return;
                }
                
                const commerces = getCommerces();
                const newCommerce = {
                    id: Date.now().toString(),
                    name,
                    costPercentage,
                    commissionPercentage
                };
                
                commerces.push(newCommerce);
                saveCommerces(commerces);
                
                // Reset form
                addCommerceForm.reset();
                addCommerceModal.classList.add('hidden');
                
                // Reload commerces
                loadCommerces();
                
                // Show notification
                showNotification('Comércio adicionado com sucesso!', 'success');
            }
            
            function deleteCommerce(id) {
                if (!confirm('Tem certeza que deseja excluir este comércio? Todas as transações relacionadas também serão excluídas.')) {
                    return;
                }
                
                // Delete commerce
                let commerces = getCommerces();
                commerces = commerces.filter(commerce => commerce.id !== id);
                saveCommerces(commerces);
                
                // Delete related transactions
                let transactions = getTransactions();
                transactions = transactions.filter(transaction => transaction.commerceId !== id);
                saveTransactions(transactions);
                
                // If we're viewing this commerce, close the modal
                if (currentCommerceId === id) {
                    closeCommerceModal();
                }
                
                // Reload commerces
                loadCommerces();
                
                // Show notification
                showNotification('Comércio excluído com sucesso!', 'success');
            }
            
            function openCommerceModal(id) {
                currentCommerceId = id;
                currentDate = new Date();
                currentMonth = currentDate.getMonth();
                currentYear = currentDate.getFullYear();
                
                // Update modal title
                const commerces = getCommerces();
                const commerce = commerces.find(c => c.id === id);
                document.getElementById('modal-title').textContent = commerce.name;
                
                // Show modal
                commerceModal.classList.remove('hidden');
                
                // Load financial data
                loadFinancialData();
            }
            
            function closeCommerceModal() {
                commerceModal.classList.add('hidden');
                currentCommerceId = null;
            }
            
            function navigateMonth(direction) {
                currentMonth += direction;
                
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                } else if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                
                loadFinancialData();
            }
            
            function loadFinancialData() {
                // Update month display
                currentMonthDisplay.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
                
                // Get commerce data
                const commerces = getCommerces();
                const commerce = commerces.find(c => c.id === currentCommerceId);
                
                // Get transactions for this commerce and month
                const transactions = getTransactions().filter(transaction => {
                    if (transaction.commerceId !== currentCommerceId) return false;
                    
                    const transactionDate = new Date(transaction.date);
                    return transactionDate.getMonth() === currentMonth && 
                           transactionDate.getFullYear() === currentYear;
                });
                
                // Update transaction count
                transactionCount.textContent = `${transactions.length} transações`;
                
                // Calculate financials
                let totalRevenue = 0;
                let totalExpenses = 0;
                
                transactions.forEach(transaction => {
                    if (transaction.type === 'revenue') {
                        totalRevenue += parseFloat(transaction.value);
                    } else {
                        totalExpenses += parseFloat(transaction.value);
                    }
                });
                
                const variableCosts = totalRevenue * (commerce.costPercentage / 100);
                const commissions = totalRevenue * (commerce.commissionPercentage / 100);
                const contributionMargin = totalRevenue - variableCosts - commissions;
                const netProfit = contributionMargin - totalExpenses;
                
                // Update percentages
                document.getElementById('variable-cost-percent').textContent = commerce.costPercentage;
                document.getElementById('commission-percent').textContent = commerce.commissionPercentage;
                
                // Update financial summary
                totalRevenueDisplay.textContent = formatCurrency(totalRevenue);
                contributionMarginDisplay.textContent = formatCurrency(contributionMargin);
                netProfitDisplay.textContent = formatCurrency(netProfit);
                
                // Update percentages
                const marginPercentage = totalRevenue > 0 ? contributionMargin / totalRevenue : 0;
                const profitPercentage = totalRevenue > 0 ? netProfit / totalRevenue : 0;
                
                document.getElementById('margin-percentage').textContent = `${formatPercentage(marginPercentage)} da receita`;
                document.getElementById('profit-percentage').textContent = `${formatPercentage(profitPercentage)} da receita`;
                
                // Update financial details
                document.getElementById('gross-revenue').textContent = formatCurrency(totalRevenue);
                document.getElementById('variable-costs').textContent = formatCurrency(variableCosts);
                document.getElementById('commissions').textContent = formatCurrency(commissions);
                document.getElementById('margin-detail').textContent = formatCurrency(contributionMargin);
                document.getElementById('fixed-expenses').textContent = formatCurrency(totalExpenses);
                document.getElementById('profit-detail').textContent = formatCurrency(netProfit);
                
                // Update visualization bars
                updateVisualizationBars(totalRevenue, contributionMargin, netProfit, totalExpenses);
                
                // Render transactions list
                renderTransactions(transactions);
            }
            
            function updateVisualizationBars(revenue, margin, profit, expenses) {
                // Find max value for scaling
                const maxValue = Math.max(revenue, margin, Math.abs(profit), expenses, 1);
                
                // Calculate heights as percentages
                const revenueHeight = (revenue / maxValue) * 100;
                const marginHeight = (margin / maxValue) * 100;
                const profitHeight = (Math.abs(profit) / maxValue) * 100;
                const expensesHeight = (expenses / maxValue) * 100;
                
                // Update bars
                document.getElementById('revenue-bar').style.height = `${revenueHeight}%`;
                document.getElementById('margin-bar').style.height = `${marginHeight}%`;
                document.getElementById('expense-bar').style.height = `${expensesHeight}%`;
                
                // Update profit bar - change color based on profit/loss
                const profitBar = document.getElementById('profit-bar');
                profitBar.style.height = `${profitHeight}%`;
                
                if (profit >= 0) {
                    profitBar.className = 'chart-bar profit-bar w-full rounded-t-lg absolute bottom-0';
                } else {
                    profitBar.className = 'chart-bar loss-bar w-full rounded-t-lg absolute bottom-0';
                }
            }
            
            function renderTransactions(transactions) {
                transactionsList.innerHTML = '';
                
                if (transactions.length === 0) {
                    transactionsList.innerHTML = `
                        <tr>
                            <td colspan="4" class="py-4 text-center text-gray-500">
                                Nenhuma transação registrada neste mês.
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                // Sort transactions by date (newest first)
                transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                transactions.forEach(transaction => {
                    const row = document.createElement('tr');
                    row.className = 'transaction-row';
                    
                    const transactionDate = new Date(transaction.date);
                    const formattedDate = transactionDate.toLocaleDateString('pt-BR');
                    
                    row.innerHTML = `
                        <td class="py-3 px-4 text-sm text-gray-700">${formattedDate}</td>
                        <td class="py-3 px-4 text-sm text-gray-700">${transaction.description}</td>
                        <td class="py-3 px-4 text-sm font-medium ${transaction.type === 'revenue' ? 'text-green-600' : 'text-red-500'}">
                            ${transaction.type === 'revenue' ? '+' : '-'} ${formatCurrency(transaction.value)}
                        </td>
                        <td class="py-3 px-4 text-sm">
                            <button class="delete-transaction-btn text-red-500 hover:text-red-700 transition-transform" data-id="${transaction.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </td>
                    `;
                    
                    transactionsList.appendChild(row);
                });
                
                // Add event listeners to delete buttons
                document.querySelectorAll('.delete-transaction-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const transactionId = e.currentTarget.getAttribute('data-id');
                        deleteTransaction(transactionId);
                    });
                });
            }
            
            function addTransaction() {
                const date = document.getElementById('transaction-date').value;
                const description = document.getElementById('transaction-description').value;
                const value = parseFloat(document.getElementById('transaction-value').value);
                const type = document.querySelector('input[name="transaction-type"]:checked').value;
                
                if (!date || !description || isNaN(value) || value <= 0) {
                    showNotification('Por favor, preencha todos os campos corretamente.', 'error');
                    return;
                }
                
                const transactions = getTransactions();
                const newTransaction = {
                    id: Date.now().toString(),
                    commerceId: currentCommerceId,
                    date,
                    description,
                    value,
                    type
                };
                
                transactions.push(newTransaction);
                saveTransactions(transactions);
                
                // Reset form
                transactionForm.reset();
                document.getElementById('transaction-date').valueAsDate = new Date();
                
                // Reload financial data
                loadFinancialData();
                
                // Show notification
                showNotification('Transação adicionada com sucesso!', 'success');
            }
            
            function deleteTransaction(id) {
                if (!confirm('Tem certeza que deseja excluir esta transação?')) {
                    return;
                }
                
                let transactions = getTransactions();
                transactions = transactions.filter(transaction => transaction.id !== id);
                saveTransactions(transactions);
                
                // Reload financial data
                loadFinancialData();
                
                // Show notification
                showNotification('Transação excluída com sucesso!', 'success');
            }
        });