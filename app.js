/* =========================================================
   MONEY MANAGER
   Pure JavaScript
   LocalStorage
   No Backend
   No Database Server
========================================================= */


/* =========================================================
   STORAGE KEY
========================================================= */

const STORAGE_KEY = "money_manager_v1";


/* =========================================================
   DEFAULT DATA
========================================================= */

const defaultData = {

    transactions: [],

    debts: [],

    accounts: [
        {
            id: generateId(),
            name: "نقدي",
            type: "cash",
            initialBalance: 0
        }
    ],

    categories: [
        {
            id: "food",
            name: "أكل",
            icon: "🍔",
            type: "expense"
        },

        {
            id: "fuel",
            name: "بنزين",
            icon: "⛽",
            type: "expense"
        },

        {
            id: "car",
            name: "سيارة",
            icon: "🚗",
            type: "expense"
        },

        {
            id: "home",
            name: "منزل",
            icon: "🏠",
            type: "expense"
        },

        {
            id: "shopping",
            name: "مشتريات",
            icon: "🛒",
            type: "expense"
        },

        {
            id: "education",
            name: "تعليم",
            icon: "🎓",
            type: "expense"
        },

        {
            id: "entertainment",
            name: "ترفيه",
            icon: "🎮",
            type: "expense"
        },

        {
            id: "phone",
            name: "اتصالات",
            icon: "📱",
            type: "expense"
        },

        {
            id: "clothes",
            name: "ملابس",
            icon: "👕",
            type: "expense"
        },

        {
            id: "health",
            name: "صحة",
            icon: "💊",
            type: "expense"
        },

        {
            id: "other",
            name: "أخرى",
            icon: "📦",
            type: "expense"
        },

        {
            id: "salary",
            name: "راتب",
            icon: "💼",
            type: "income"
        },

        {
            id: "freelance",
            name: "عمل حر",
            icon: "💻",
            type: "income"
        },

        {
            id: "gift",
            name: "هدية",
            icon: "🎁",
            type: "income"
        },

        {
            id: "other_income",
            name: "دخل آخر",
            icon: "💰",
            type: "income"
        }
    ],

    budget: 0

};


/* =========================================================
   LOAD DATA
========================================================= */

let data = loadData();


function loadData() {

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {

        return JSON.parse(
            JSON.stringify(defaultData)
        );

    }

    try {

        const parsed = JSON.parse(saved);

        return {
            ...defaultData,
            ...parsed
        };

    } catch (error) {

        console.error(error);

        return JSON.parse(
            JSON.stringify(defaultData)
        );

    }

}


/* =========================================================
   SAVE DATA
========================================================= */

function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );

}


/* =========================================================
   ID GENERATOR
========================================================= */

function generateId() {

    return Date.now().toString(36)
        + Math.random()
            .toString(36)
            .substring(2, 8);

}


/* =========================================================
   FORMAT MONEY
========================================================= */

function money(value) {

    return Number(value || 0)
        .toLocaleString("ar-JO", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

}


/* =========================================================
   DATE HELPERS
========================================================= */

function today() {

    const date = new Date();

    const year = date.getFullYear();

    const month =
        String(date.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(date.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;

}


function formatDate(dateString) {

    if (!dateString) return "-";

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString(
        "ar-JO",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


/* =========================================================
   MONTH HELPERS
========================================================= */

function currentMonth() {

    const date = new Date();

    return date.getMonth();

}


function currentYear() {

    return new Date().getFullYear();

}


function isCurrentMonth(dateString) {

    if (!dateString) return false;

    const date = new Date(
        dateString + "T00:00:00"
    );

    return (
        date.getMonth() === currentMonth()
        &&
        date.getFullYear() === currentYear()
    );

}


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


function initialize() {

    setupNavigation();

    setupEvents();

    setDefaultDates();

    populateCategories();

    populateAccounts();

    renderAll();

}


/* =========================================================
   NAVIGATION
========================================================= */

function setupNavigation() {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const page =
                        button.dataset.page;

                    showPage(page);

                }
            );

        });

}


function showPage(pageName) {

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.page === pageName
            );

        });


    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });


    const page =
        document.getElementById(
            pageName + "Page"
        );

    if (page) {

        page.classList.add("active");

    }


    const titles = {

        dashboard: [
            "الرئيسية",
            "نظرة عامة على وضعك المالي"
        ],

        transactions: [
            "العمليات",
            "إدارة الدخل والمصاريف"
        ],

        debts: [
            "الديون",
            "مين إلك ومين عليك"
        ],

        accounts: [
            "الحسابات",
            "إدارة حساباتك ومحافظك"
        ],

        reports: [
            "التقارير",
            "تحليل وضعك المالي"
        ],

        settings: [
            "الإعدادات",
            "النسخ الاحتياطي والإعدادات"
        ]

    };


    if (titles[pageName]) {

        document.getElementById(
            "pageTitle"
        ).textContent =
            titles[pageName][0];


        document.getElementById(
            "pageSubtitle"
        ).textContent =
            titles[pageName][1];

    }


    if (pageName === "reports") {

        renderReports();

    }


    if (pageName === "dashboard") {

        renderDashboard();

    }


    if (pageName === "debts") {

        renderDebts();

    }


    if (pageName === "accounts") {

        renderAccounts();

    }


    if (pageName === "transactions") {

        renderTransactions();

    }


    // close mobile sidebar

    document
        .querySelector(".sidebar")
        .classList.remove("open");

}


/* =========================================================
   EVENT SETUP
========================================================= */

function setupEvents() {

    document
        .getElementById("quickAddBtn")
        .addEventListener(
            "click",
            () => openModal("quickModal")
        );


    document
        .getElementById("mobileMenuBtn")
        .addEventListener(
            "click",
            () => {

                document
                    .querySelector(".sidebar")
                    .classList.toggle("open");

            }
        );


    document
        .getElementById("toggleBalanceBtn")
        .addEventListener(
            "click",
            toggleBalance
        );


    document
        .getElementById("transactionForm")
        .addEventListener(
            "submit",
            saveTransaction
        );


    document
        .getElementById("debtForm")
        .addEventListener(
            "submit",
            saveDebt
        );


    document
        .getElementById("accountForm")
        .addEventListener(
            "submit",
            saveAccount
        );


    document
        .getElementById("transactionSearch")
        .addEventListener(
            "input",
            renderTransactions
        );


    document
        .getElementById("transactionTypeFilter")
        .addEventListener(
            "change",
            renderTransactions
        );


    document
        .getElementById("transactionCategoryFilter")
        .addEventListener(
            "change",
            renderTransactions
        );


    document
        .getElementById("exportBtn")
        .addEventListener(
            "click",
            exportData
        );


    document
        .getElementById("importFile")
        .addEventListener(
            "change",
            importData
        );


    document
        .getElementById("clearDataBtn")
        .addEventListener(
            "click",
            clearAllData
        );


    document
        .getElementById("saveBudgetBtn")
        .addEventListener(
            "click",
            saveBudget
        );


    document
        .getElementById("reportMonth")
        .addEventListener(
            "change",
            renderReports
        );


    document
        .getElementById("reportYear")
        .addEventListener(
            "change",
            renderReports
        );


    document
        .querySelectorAll("[data-debt-filter]")
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    document
                        .querySelectorAll("[data-debt-filter]")
                        .forEach(btn =>
                            btn.classList.remove("active")
                        );

                    button.classList.add("active");

                    renderDebts(
                        button.dataset.debtFilter
                    );

                }
            );

        });

}


/* =========================================================
   RENDER ALL
========================================================= */

function renderAll() {

    populateCategories();

    populateAccounts();

    renderDashboard();

    renderTransactions();

    renderDebts();

    renderAccounts();

    initializeReports();

    renderReports();

    document.getElementById(
        "monthlyBudget"
    ).value = data.budget || 0;

}


/* =========================================================
   DASHBOARD
========================================================= */

function renderDashboard() {

    const balance =
        calculateTotalBalance();


    document.getElementById(
        "totalBalance"
    ).textContent =
        money(balance);


    const income =
        data.transactions
            .filter(t =>
                t.type === "income"
                &&
                isCurrentMonth(t.date)
            )
            .reduce(
                (sum, t) =>
                    sum + Number(t.amount),
                0
            );


    const expense =
        data.transactions
            .filter(t =>
                t.type === "expense"
                &&
                isCurrentMonth(t.date)
            )
            .reduce(
                (sum, t) =>
                    sum + Number(t.amount),
                0
            );


    document.getElementById(
        "monthlyIncome"
    ).textContent =
        money(income) + " د.أ";


    document.getElementById(
        "monthlyExpense"
    ).textContent =
        money(expense) + " د.أ";


    const receivable =
        calculateDebt(
            "receivable"
        );


    const payable =
        calculateDebt(
            "payable"
        );


    document.getElementById(
        "totalReceivable"
    ).textContent =
        money(receivable) + " د.أ";


    document.getElementById(
        "totalPayable"
    ).textContent =
        money(payable) + " د.أ";


    const status =
        document.getElementById(
            "balanceStatus"
        );


    if (balance > 0) {

        status.textContent =
            "وضعك المالي جيد 👍";

    } else if (balance === 0) {

        status.textContent =
            "رصيدك صفر حالياً";

    } else {

        status.textContent =
            "رصيدك الحالي بالسالب ⚠️";

    }


    renderRecentTransactions();

    renderExpenseChart();

    renderBudget();

}


/* =========================================================
   CALCULATE BALANCE
========================================================= */

function calculateTotalBalance() {

    let balance = 0;


    data.accounts.forEach(account => {

        balance +=
            Number(account.initialBalance || 0);


        data.transactions
            .filter(t =>
                t.accountId === account.id
            )
            .forEach(t => {

                if (t.type === "income") {

                    balance +=
                        Number(t.amount);

                } else {

                    balance -=
                        Number(t.amount);

                }

            });

    });


    return balance;

}


/* =========================================================
   DEBT CALCULATION
========================================================= */

function calculateDebt(type) {

    return data.debts
        .filter(d =>
            d.type === type
            &&
            d.status !== "paid"
        )
        .reduce(
            (sum, d) =>
                sum +
                (
                    Number(d.amount)
                    -
                    Number(d.paid || 0)
                ),
            0
        );

}


/* =========================================================
   RECENT TRANSACTIONS
========================================================= */

function renderRecentTransactions() {

    const container =
        document.getElementById(
            "recentTransactions"
        );


    const transactions =
        [...data.transactions]
            .sort(
                (a, b) =>
                    new Date(b.date)
                    -
                    new Date(a.date)
            )
            .slice(0, 7);


    if (!transactions.length) {

        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💸</div>
                <p>لا توجد عمليات حتى الآن.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        transactions
            .map(transaction => {

                const category =
                    data.categories.find(
                        c =>
                            c.id ===
                            transaction.categoryId
                    );


                const icon =
                    category?.icon ||
                    (
                        transaction.type === "income"
                            ? "💰"
                            : "💸"
                    );


                const sign =
                    transaction.type === "income"
                        ? "+"
                        : "-";


                return `

                    <div class="transaction-row">

                        <div class="transaction-info">

                            <div class="transaction-icon">
                                ${icon}
                            </div>

                            <div>

                                <div class="transaction-name">
                                    ${escapeHTML(
                                        transaction.description
                                    )}
                                </div>

                                <div class="transaction-date">
                                    ${formatDate(
                                        transaction.date
                                    )}
                                </div>

                            </div>

                        </div>

                        <div class="
                            transaction-amount
                            ${
                                transaction.type === "income"
                                    ? "amount-income"
                                    : "amount-expense"
                            }
                        ">

                            ${sign}
                            ${money(transaction.amount)}
                            د.أ

                        </div>

                    </div>

                `;

            })
            .join("");

}


/* =========================================================
   EXPENSE CHART
========================================================= */

let expenseChart = null;


function renderExpenseChart() {

    const canvas =
        document.getElementById(
            "expenseChart"
        );


    if (!canvas) return;


    const totals = {};


    data.transactions
        .filter(t =>
            t.type === "expense"
            &&
            isCurrentMonth(t.date)
        )
        .forEach(t => {

            const category =
                data.categories.find(
                    c =>
                        c.id ===
                        t.categoryId
                );


            const name =
                category?.name ||
                "أخرى";


            totals[name] =
                (totals[name] || 0)
                +
                Number(t.amount);

        });


    const labels =
        Object.keys(totals);


    const values =
        Object.values(totals);


    if (expenseChart) {

        expenseChart.destroy();

    }


    expenseChart =
        new Chart(
            canvas,
            {

                type: "doughnut",

                data: {

                    labels,

                    datasets: [
                        {
                            data: values
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            position: "bottom"
                        }

                    }

                }

            }
        );

}


/* =========================================================
   BUDGET
========================================================= */

function renderBudget() {

    const spent =
        data.transactions
            .filter(t =>
                t.type === "expense"
                &&
                isCurrentMonth(t.date)
            )
            .reduce(
                (sum, t) =>
                    sum + Number(t.amount),
                0
            );


    const budget =
        Number(data.budget || 0);


    document.getElementById(
        "budgetSpent"
    ).textContent =
        money(spent);


    document.getElementById(
        "budgetLimit"
    ).textContent =
        money(budget);


    const progress =
        document.getElementById(
            "budgetProgress"
        );


    if (budget <= 0) {

        progress.style.width = "0%";

        document.getElementById(
            "budgetMessage"
        ).textContent =
            "لم تحدد ميزانية شهرية بعد.";

        return;

    }


    const percentage =
        Math.min(
            (spent / budget) * 100,
            100
        );


    progress.style.width =
        percentage + "%";


    const message =
        document.getElementById(
            "budgetMessage"
        );


    if (percentage >= 100) {

        message.textContent =
            "⚠️ تجاوزت الميزانية الشهرية.";

    } else if (percentage >= 80) {

        message.textContent =
            "⚠️ اقتربت من تجاوز الميزانية.";

    } else {

        message.textContent =
            `متبقي ${money(
                budget - spent
            )} د.أ من الميزانية.`;

    }

}


/* =========================================================
   TRANSACTIONS
========================================================= */

function renderTransactions() {

    const table =
        document.getElementById(
            "transactionsTable"
        );


    if (!table) return;


    const search =
        document.getElementById(
            "transactionSearch"
        ).value
            .toLowerCase()
            .trim();


    const type =
        document.getElementById(
            "transactionTypeFilter"
        ).value;


    const category =
        document.getElementById(
            "transactionCategoryFilter"
        ).value;


    let transactions =
        [...data.transactions];


    if (search) {

        transactions =
            transactions.filter(t =>
                String(t.description)
                    .toLowerCase()
                    .includes(search)
                ||
                String(t.note || "")
                    .toLowerCase()
                    .includes(search)
            );

    }


    if (type !== "all") {

        transactions =
            transactions.filter(
                t =>
                    t.type === type
            );

    }


    if (category !== "all") {

        transactions =
            transactions.filter(
                t =>
                    t.categoryId === category
            );

    }


    transactions.sort(
        (a, b) =>
            new Date(b.date)
            -
            new Date(a.date)
    );


    if (!transactions.length) {

        table.innerHTML = `
            <tr>
                <td colspan="7">
                    <div class="empty-state">
                        <div class="empty-icon">
                            💸
                        </div>
                        <p>
                            لا توجد عمليات.
                        </p>
                    </div>
                </td>
            </tr>
        `;

        return;

    }


    table.innerHTML =
        transactions
            .map(t => {

                const category =
                    data.categories.find(
                        c =>
                            c.id ===
                            t.categoryId
                    );


                const account =
                    data.accounts.find(
                        a =>
                            a.id ===
                            t.accountId
                    );


                return `

                    <tr>

                        <td>
                            ${formatDate(t.date)}
                        </td>

                        <td>

                            ${
                                t.type === "income"
                                    ? '<span class="amount-income">دخل</span>'
                                    : '<span class="amount-expense">مصروف</span>'
                            }

                        </td>

                        <td>
                            ${escapeHTML(
                                t.description
                            )}
                        </td>

                        <td>
                            ${
                                category
                                    ? category.icon +
                                      " " +
                                      escapeHTML(category.name)
                                    : "-"
                            }
                        </td>

                        <td>
                            ${
                                account
                                    ? escapeHTML(account.name)
                                    : "-"
                            }
                        </td>

                        <td class="
                            ${
                                t.type === "income"
                                    ? "amount-income"
                                    : "amount-expense"
                            }
                        ">

                            ${
                                t.type === "income"
                                    ? "+"
                                    : "-"
                            }

                            ${money(t.amount)}
                            د.أ

                        </td>

                        <td>

                            <div class="action-buttons">

                                <button
                                    class="small-btn"
                                    onclick="editTransaction('${t.id}')"
                                >
                                    ✏️
                                </button>

                                <button
                                    class="small-btn delete"
                                    onclick="deleteTransaction('${t.id}')"
                                >
                                    🗑️
                                </button>

                            </div>

                        </td>

                    </tr>

                `;

            })
            .join("");

}


/* =========================================================
   POPULATE CATEGORIES
========================================================= */

function populateCategories() {

    const transactionCategory =
        document.getElementById(
            "transactionCategory"
        );


    const filter =
        document.getElementById(
            "transactionCategoryFilter"
        );


    if (transactionCategory) {

        const current =
            transactionCategory.value;


        transactionCategory.innerHTML =
            data.categories
                .map(c => `
                    <option value="${c.id}">
                        ${c.icon} ${escapeHTML(c.name)}
                    </option>
                `)
                .join("");


        if (current) {

            transactionCategory.value =
                current;

        }

    }


    if (filter) {

        const current =
            filter.value;


        filter.innerHTML = `
            <option value="all">
                كل التصنيفات
            </option>
        `;

        filter.innerHTML +=
            data.categories
                .filter(
                    c =>
                        c.type === "expense"
                )
                .map(c => `
                    <option value="${c.id}">
                        ${c.icon} ${escapeHTML(c.name)}
                    </option>
                `)
                .join("");


        if (current) {

            filter.value =
                current;

        }

    }

}


/* =========================================================
   POPULATE ACCOUNTS
========================================================= */

function populateAccounts() {

    const select =
        document.getElementById(
            "transactionAccount"
        );


    if (!select) return;


    const current =
        select.value;


    select.innerHTML =
        data.accounts
            .map(a => `
                <option value="${a.id}">
                    ${getAccountIcon(a.type)}
                    ${escapeHTML(a.name)}
                </option>
            `)
            .join("");


    if (current) {

        select.value = current;

    }

}


function getAccountIcon(type) {

    const icons = {

        cash: "💵",

        bank: "🏦",

        wallet: "📱",

        other: "💼"

    };

    return icons[type] || "💼";

}


/* =========================================================
   OPEN TRANSACTION MODAL
========================================================= */

function openTransactionModal(type = "expense") {

    const form =
        document.getElementById(
            "transactionForm"
        );


    form.reset();


    document.getElementById(
        "transactionId"
    ).value = "";


    document.getElementById(
        "transactionDate"
    ).value = today();


    document.querySelector(
        `input[name="transactionType"][value="${type}"]`
    ).checked = true;


    document.getElementById(
        "transactionModalTitle"
    ).textContent =
        type === "income"
            ? "إضافة دخل"
            : "إضافة مصروف";


    populateCategories();

    populateAccounts();


    // Select first matching category

    const firstCategory =
        data.categories.find(
            c =>
                c.type === type
        );


    if (firstCategory) {

        document.getElementById(
            "transactionCategory"
        ).value =
            firstCategory.id;

    }


    openModal(
        "transactionModal"
    );

}


/* =========================================================
   SAVE TRANSACTION
========================================================= */

function saveTransaction(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "transactionId"
        ).value;


    const type =
        document.querySelector(
            'input[name="transactionType"]:checked'
        ).value;


    const transaction = {

        id:
            id || generateId(),

        type,

        amount:
            Number(
                document.getElementById(
                    "transactionAmount"
                ).value
            ),

        description:
            document.getElementById(
                "transactionDescription"
            ).value.trim(),

        categoryId:
            document.getElementById(
                "transactionCategory"
            ).value,

        accountId:
            document.getElementById(
                "transactionAccount"
            ).value,

        date:
            document.getElementById(
                "transactionDate"
            ).value,

        note:
            document.getElementById(
                "transactionNote"
            ).value.trim()

    };


    if (
        !transaction.amount
        ||
        transaction.amount <= 0
        ||
        !transaction.description
    ) {

        showToast(
            "يرجى إدخال البيانات المطلوبة",
            "⚠️"
        );

        return;

    }


    if (id) {

        const index =
            data.transactions.findIndex(
                t => t.id === id
            );


        if (index !== -1) {

            data.transactions[index] =
                transaction;

        }

    } else {

        data.transactions.push(
            transaction
        );

    }


    saveData();

    closeModal(
        "transactionModal"
    );

    renderAll();

    showToast(
        id
            ? "تم تعديل العملية"
            : "تمت إضافة العملية"
    );

}


/* =========================================================
   EDIT TRANSACTION
========================================================= */

function editTransaction(id) {

    const transaction =
        data.transactions.find(
            t => t.id === id
        );


    if (!transaction) return;


    document.getElementById(
        "transactionId"
    ).value =
        transaction.id;


    document.querySelector(
        `input[name="transactionType"][value="${transaction.type}"]`
    ).checked = true;


    document.getElementById(
        "transactionAmount"
    ).value =
        transaction.amount;


    document.getElementById(
        "transactionDescription"
    ).value =
        transaction.description;


    populateCategories();

    populateAccounts();


    document.getElementById(
        "transactionCategory"
    ).value =
        transaction.categoryId;


    document.getElementById(
        "transactionAccount"
    ).value =
        transaction.accountId;


    document.getElementById(
        "transactionDate"
    ).value =
        transaction.date;


    document.getElementById(
        "transactionNote"
    ).value =
        transaction.note || "";


    document.getElementById(
        "transactionModalTitle"
    ).textContent =
        "تعديل العملية";


    openModal(
        "transactionModal"
    );

}


/* =========================================================
   DELETE TRANSACTION
========================================================= */

function deleteTransaction(id) {

    const transaction =
        data.transactions.find(
            t => t.id === id
        );


    if (!transaction) return;


    const confirmed =
        confirm(
            `هل تريد حذف العملية "${transaction.description}"؟`
        );


    if (!confirmed) return;


    data.transactions =
        data.transactions.filter(
            t => t.id !== id
        );


    saveData();

    renderAll();

    showToast(
        "تم حذف العملية",
        "🗑️"
    );

}


/* =========================================================
   DEBTS
========================================================= */

let currentDebtFilter = "all";


function renderDebts(
    filter = currentDebtFilter
) {

    currentDebtFilter = filter;


    const container =
        document.getElementById(
            "debtsContainer"
        );


    const receivable =
        calculateDebt(
            "receivable"
        );


    const payable =
        calculateDebt(
            "payable"
        );


    document.getElementById(
        "debtReceivableSummary"
    ).textContent =
        money(receivable) + " د.أ";


    document.getElementById(
        "debtPayableSummary"
    ).textContent =
        money(payable) + " د.أ";


    document.getElementById(
        "debtNetSummary"
    ).textContent =
        money(
            receivable - payable
        ) + " د.أ";


    let debts =
        [...data.debts];


    if (filter !== "all") {

        debts =
            debts.filter(
                d =>
                    d.type === filter
            );

    }


    if (!debts.length) {

        container.innerHTML = `

            <div class="card">

                <div class="empty-state">

                    <div class="empty-icon">
                        👥
                    </div>

                    <p>
                        لا توجد ديون مسجلة.
                    </p>

                </div>

            </div>

        `;

        return;

    }


    container.innerHTML =
        debts
            .map(renderDebtCard)
            .join("");

}


function renderDebtCard(debt) {

    const remaining =
        Math.max(
            Number(debt.amount)
            -
            Number(debt.paid || 0),
            0
        );


    const percentage =
        debt.amount > 0
            ? Math.min(
                (
                    Number(debt.paid || 0)
                    /
                    Number(debt.amount)
                ) * 100,
                100
            )
            : 0;


    const isReceivable =
        debt.type === "receivable";


    return `

        <div class="
            debt-card
            ${isReceivable ? "receivable" : "payable"}
        ">

            <div class="debt-card-header">

                <div class="debt-person">

                    <div class="person-avatar">
                        👤
                    </div>

                    <div>

                        <h4>
                            ${escapeHTML(debt.person)}
                        </h4>

                        <span>
                            ${
                                isReceivable
                                    ? "إلك عنده"
                                    : "عليك له"
                            }
                        </span>

                    </div>

                </div>

                <button
                    class="small-btn"
                    onclick="deleteDebt('${debt.id}')"
                >
                    🗑️
                </button>

            </div>


            <div class="debt-amount">
                ${money(remaining)} د.أ
            </div>

            <div class="debt-meta">

                الأصلي:
                ${money(debt.amount)}
                د.أ

                <br>

                المدفوع:
                ${money(debt.paid || 0)}
                د.أ

            </div>


            <div class="progress" style="margin-top:15px">

                <div
                    class="progress-bar"
                    style="width:${percentage}%"
                ></div>

            </div>


            <div class="debt-meta" style="margin-top:10px">

                ${
                    debt.dueDate
                        ? "الاستحقاق: " +
                          formatDate(debt.dueDate)
                        : "بدون موعد استحقاق"
                }

            </div>


            <div class="debt-actions">

                ${
                    remaining > 0
                        ? `
                            <button
                                class="primary-btn"
                                onclick="payDebt('${debt.id}')"
                            >
                                💰 تسجيل دفعة
                            </button>
                        `
                        : `
                            <button
                                class="secondary-btn"
                                disabled
                            >
                                ✓ مكتمل
                            </button>
                        `
                }

            </div>

        </div>

    `;

}


/* =========================================================
   OPEN DEBT MODAL
========================================================= */

function openDebtModal(
    type = "receivable"
) {

    document
        .getElementById("debtForm")
        .reset();


    document.getElementById(
        "debtId"
    ).value = "";


    document.getElementById(
        "debtDate"
    ).value = today();


    document.querySelector(
        `input[name="debtType"][value="${type}"]`
    ).checked = true;


    document.getElementById(
        "debtModalTitle"
    ).textContent =
        type === "receivable"
            ? "إضافة دين إلي"
            : "إضافة دين علي";


    openModal(
        "debtModal"
    );

}


/* =========================================================
   SAVE DEBT
========================================================= */

function saveDebt(event) {

    event.preventDefault();


    const id =
        document.getElementById(
            "debtId"
        ).value;


    const debt = {

        id:
            id || generateId(),

        type:
            document.querySelector(
                'input[name="debtType"]:checked'
            ).value,

        person:
            document.getElementById(
                "debtPerson"
            ).value.trim(),

        amount:
            Number(
                document.getElementById(
                    "debtAmount"
                ).value
            ),

        paid: 0,

        date:
            document.getElementById(
                "debtDate"
            ).value,

        dueDate:
            document.getElementById(
                "debtDueDate"
            ).value,

        note:
            document.getElementById(
                "debtNote"
            ).value.trim(),

        status:
            "active"

    };


    if (
        !debt.person
        ||
        !debt.amount
        ||
        debt.amount <= 0
    ) {

        showToast(
            "يرجى إدخال اسم الشخص والمبلغ",
            "⚠️"
        );

        return;

    }


    if (id) {

        const old =
            data.debts.find(
                d => d.id === id
            );


        if (old) {

            debt.paid =
                old.paid || 0;

            data.debts[
                data.debts.indexOf(old)
            ] = debt;

        }

    } else {

        data.debts.push(debt);

    }


    saveData();

    closeModal("debtModal");

    renderAll();

    showToast(
        id
            ? "تم تعديل الدين"
            : "تمت إضافة الدين"
    );

}


/* =========================================================
   PAY DEBT
========================================================= */

function payDebt(id) {

    const debt =
        data.debts.find(
            d => d.id === id
        );


    if (!debt) return;


    const remaining =
        Number(debt.amount)
        -
        Number(debt.paid || 0);


    const value =
        prompt(
            `المتبقي: ${money(remaining)} د.أ\n\nكم تريد تسجيل كدفعة؟`
        );


    if (value === null) return;


    const payment =
        Number(value);


    if (
        !payment
        ||
        payment <= 0
        ||
        payment > remaining
    ) {

        alert(
            "قيمة الدفعة غير صحيحة."
        );

        return;

    }


    debt.paid =
        Number(debt.paid || 0)
        +
        payment;


    if (
        debt.paid >=
        Number(debt.amount)
    ) {

        debt.paid =
            Number(debt.amount);

        debt.status =
            "paid";

    }


    saveData();

    renderAll();

    showToast(
        "تم تسجيل الدفعة",
        "💰"
    );

}


/* =========================================================
   DELETE DEBT
========================================================= */

function deleteDebt(id) {

    const debt =
        data.debts.find(
            d => d.id === id
        );


    if (!debt) return;


    if (
        !confirm(
            `هل تريد حذف دين ${debt.person}؟`
        )
    ) {

        return;

    }


    data.debts =
        data.debts.filter(
            d => d.id !== id
        );


    saveData();

    renderAll();

    showToast(
        "تم حذف الدين",
        "🗑️"
    );

}


/* =========================================================
   ACCOUNTS
========================================================= */

function renderAccounts() {

    const container =
        document.getElementById(
            "accountsGrid"
        );


    if (!data.accounts.length) {

        container.innerHTML = `
            <div class="card">
                <div class="empty-state">
                    <div class="empty-icon">🏦</div>
                    <p>لا توجد حسابات.</p>
                </div>
            </div>
        `;

        return;

    }


    container.innerHTML =
        data.accounts
            .map(account => {

                const balance =
                    calculateAccountBalance(
                        account.id
                    );


                return `

                    <div class="account-card">

                        <div class="account-top">

                            <div class="account-icon">
                                ${getAccountIcon(account.type)}
                            </div>

                            <div class="action-buttons">

                                <button
                                    class="small-btn"
                                    onclick="deleteAccount('${account.id}')"
                                >
                                    🗑️
                                </button>

                            </div>

                        </div>

                        <div class="account-name">
                            ${escapeHTML(account.name)}
                        </div>

                        <div class="account-type">
                            ${getAccountTypeName(account.type)}
                        </div>

                        <div class="account-balance">
                            ${money(balance)}
                            <small>د.أ</small>
                        </div>

                    </div>

                `;

            })
            .join("");

}


function calculateAccountBalance(accountId) {

    const account =
        data.accounts.find(
            a => a.id === accountId
        );


    if (!account) return 0;


    let balance =
        Number(
            account.initialBalance || 0
        );


    data.transactions
        .filter(
            t =>
                t.accountId === accountId
        )
        .forEach(t => {

            if (t.type === "income") {

                balance +=
                    Number(t.amount);

            } else {

                balance -=
                    Number(t.amount);

            }

        });


    return balance;

}


function getAccountTypeName(type) {

    const names = {

        cash: "نقدي",

        bank: "حساب بنكي",

        wallet: "محفظة إلكترونية",

        other: "حساب آخر"

    };

    return names[type] || "أخرى";

}


/* =========================================================
   ACCOUNT MODAL
========================================================= */

function openAccountModal() {

    document
        .getElementById("accountForm")
        .reset();


    document.getElementById(
        "accountId"
    ).value = "";


    openModal(
        "accountModal"
    );

}


/* =========================================================
   SAVE ACCOUNT
========================================================= */

function saveAccount(event) {

    event.preventDefault();


    const name =
        document.getElementById(
            "accountName"
        ).value.trim();


    const type =
        document.getElementById(
            "accountType"
        ).value;


    const initialBalance =
        Number(
            document.getElementById(
                "accountInitialBalance"
            ).value
        );


    if (!name) {

        showToast(
            "أدخل اسم الحساب",
            "⚠️"
        );

        return;

    }


    data.accounts.push({

        id: generateId(),

        name,

        type,

        initialBalance:
            initialBalance || 0

    });


    saveData();

    closeModal("accountModal");

    renderAll();

    showToast(
        "تمت إضافة الحساب"
    );

}


/* =========================================================
   DELETE ACCOUNT
========================================================= */

function deleteAccount(id) {

    if (data.accounts.length <= 1) {

        alert(
            "يجب أن يبقى حساب واحد على الأقل."
        );

        return;

    }


    const hasTransactions =
        data.transactions.some(
            t =>
                t.accountId === id
        );


    if (hasTransactions) {

        alert(
            "لا يمكن حذف حساب يحتوي على عمليات. احذف أو عدّل العمليات أولاً."
        );

        return;

    }


    if (
        !confirm(
            "هل تريد حذف هذا الحساب؟"
        )
    ) {

        return;

    }


    data.accounts =
        data.accounts.filter(
            a => a.id !== id
        );


    saveData();

    renderAll();

    showToast(
        "تم حذف الحساب",
        "🗑️"
    );

}


/* =========================================================
   REPORTS INITIALIZATION
========================================================= */

function initializeReports() {

    const monthSelect =
        document.getElementById(
            "reportMonth"
        );


    const yearSelect =
        document.getElementById(
            "reportYear"
        );


    if (!monthSelect || !yearSelect)
        return;


    const months = [

        "يناير",
        "فبراير",
        "مارس",
        "أبريل",
        "مايو",
        "يونيو",
        "يوليو",
        "أغسطس",
        "سبتمبر",
        "أكتوبر",
        "نوفمبر",
        "ديسمبر"

    ];


    monthSelect.innerHTML =
        months
            .map(
                (month, index) => `
                    <option value="${index}">
                        ${month}
                    </option>
                `
            )
            .join("");


    monthSelect.value =
        currentMonth();


    const years = new Set();

    years.add(currentYear());


    data.transactions.forEach(t => {

        if (t.date) {

            years.add(
                new Date(
                    t.date + "T00:00:00"
                ).getFullYear()
            );

        }

    });


    yearSelect.innerHTML =
        [...years]
            .sort(
                (a,b) => b-a
            )
            .map(
                year => `
                    <option value="${year}">
                        ${year}
                    </option>
                `
            )
            .join("");


    yearSelect.value =
        currentYear();

}


/* =========================================================
   REPORTS
========================================================= */

let reportCategoryChart = null;

let incomeExpenseChart = null;


function renderReports() {

    const month =
        Number(
            document.getElementById(
                "reportMonth"
            )?.value
        );


    const year =
        Number(
            document.getElementById(
                "reportYear"
            )?.value
        );


    if (
        Number.isNaN(month)
        ||
        Number.isNaN(year)
    ) {

        return;

    }


    const transactions =
        data.transactions.filter(t => {

            const date =
                new Date(
                    t.date + "T00:00:00"
                );

            return (
                date.getMonth() === month
                &&
                date.getFullYear() === year
            );

        });


    const income =
        transactions
            .filter(
                t =>
                    t.type === "income"
            )
            .reduce(
                (sum,t) =>
                    sum + Number(t.amount),
                0
            );


    const expense =
        transactions
            .filter(
                t =>
                    t.type === "expense"
            )
            .reduce(
                (sum,t) =>
                    sum + Number(t.amount),
                0
            );


    document.getElementById(
        "reportIncome"
    ).textContent =
        money(income) + " د.أ";


    document.getElementById(
        "reportExpense"
    ).textContent =
        money(expense) + " د.أ";


    document.getElementById(
        "reportDifference"
    ).textContent =
        money(
            income - expense
        ) + " د.أ";


    renderReportCategoryChart(
        transactions
    );


    renderIncomeExpenseChart(
        income,
        expense
    );


    renderCategoryReportList(
        transactions
    );

}


/* =========================================================
   REPORT CATEGORY CHART
========================================================= */

function renderReportCategoryChart(
    transactions
) {

    const canvas =
        document.getElementById(
            "reportCategoryChart"
        );


    if (!canvas) return;


    const totals = {};


    transactions
        .filter(
            t =>
                t.type === "expense"
        )
        .forEach(t => {

            const category =
                data.categories.find(
                    c =>
                        c.id ===
                        t.categoryId
                );


            const name =
                category?.name ||
                "أخرى";


            totals[name] =
                (totals[name] || 0)
                +
                Number(t.amount);

        });


    if (reportCategoryChart) {

        reportCategoryChart.destroy();

    }


    reportCategoryChart =
        new Chart(
            canvas,
            {

                type: "pie",

                data: {

                    labels:
                        Object.keys(totals),

                    datasets: [
                        {
                            data:
                                Object.values(totals)
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            position: "bottom"
                        }

                    }

                }

            }
        );

}


/* =========================================================
   INCOME EXPENSE CHART
========================================================= */

function renderIncomeExpenseChart(
    income,
    expense
) {

    const canvas =
        document.getElementById(
            "incomeExpenseChart"
        );


    if (!canvas) return;


    if (incomeExpenseChart) {

        incomeExpenseChart.destroy();

    }


    incomeExpenseChart =
        new Chart(
            canvas,
            {

                type: "bar",

                data: {

                    labels: [
                        "الدخل",
                        "المصروف"
                    ],

                    datasets: [
                        {
                            label:
                                "المبلغ",

                            data: [
                                income,
                                expense
                            ]
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    scales: {

                        y: {
                            beginAtZero: true
                        }

                    }

                }

            }
        );

}


/* =========================================================
   CATEGORY REPORT LIST
========================================================= */

function renderCategoryReportList(
    transactions
) {

    const container =
        document.getElementById(
            "categoryReportList"
        );


    const totals = {};


    transactions
        .filter(
            t =>
                t.type === "expense"
        )
        .forEach(t => {

            const category =
                data.categories.find(
                    c =>
                        c.id ===
                        t.categoryId
                );


            const id =
                t.categoryId ||
                "other";


            if (!totals[id]) {

                totals[id] = {

                    name:
                        category?.name ||
                        "أخرى",

                    icon:
                        category?.icon ||
                        "📦",

                    amount: 0

                };

            }


            totals[id].amount +=
                Number(t.amount);

        });


    const list =
        Object.values(totals)
            .sort(
                (a,b) =>
                    b.amount - a.amount
            );


    if (!list.length) {

        container.innerHTML = `
            <div class="empty-state">
                <p>لا توجد مصاريف لهذا الشهر.</p>
            </div>
        `;

        return;

    }


    const max =
        list[0].amount;


    container.innerHTML =
        list.map(item => {

            const percentage =
                max > 0
                    ? (
                        item.amount /
                        max
                    ) * 100
                    : 0;


            return `

                <div class="category-report-row">

                    <div>
                        ${item.icon}
                        ${escapeHTML(item.name)}
                    </div>

                    <div class="category-report-bar">

                        <div
                            style="width:${percentage}%"
                        ></div>

                    </div>

                    <strong>
                        ${money(item.amount)}
                    </strong>

                </div>

            `;

        }).join("");

}


/* =========================================================
   EXPORT DATA
========================================================= */

function exportData() {

    const backup = {

        app: "Money Manager",

        version: 1,

        exportedAt:
            new Date().toISOString(),

        data

    };


    const json =
        JSON.stringify(
            backup,
            null,
            2
        );


    const blob =
        new Blob(
            [json],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    const date =
        new Date()
            .toISOString()
            .split("T")[0];


    link.href = url;

    link.download =
        `money-manager-backup-${date}.json`;


    link.click();


    URL.revokeObjectURL(
        url
    );


    showToast(
        "تم تصدير بياناتك",
        "📤"
    );

}


/* =========================================================
   IMPORT DATA
========================================================= */

function importData(event) {

    const file =
        event.target.files[0];


    if (!file) return;


    const reader =
        new FileReader();


    reader.onload =
        function(e) {

            try {

                const backup =
                    JSON.parse(
                        e.target.result
                    );


                if (
                    !backup.data
                    ||
                    !Array.isArray(
                        backup.data.transactions
                    )
                ) {

                    throw new Error(
                        "Invalid backup"
                    );

                }


                const confirmed =
                    confirm(
                        "استيراد النسخة سيستبدل البيانات الحالية. هل أنت متأكد؟"
                    );


                if (!confirmed) {

                    event.target.value =
                        "";

                    return;

                }


                data = {

                    ...defaultData,

                    ...backup.data

                };


                saveData();

                renderAll();

                showToast(
                    "تم استيراد البيانات",
                    "📥"
                );


            } catch(error) {

                console.error(error);

                alert(
                    "ملف النسخة الاحتياطية غير صالح."
                );

            }

            event.target.value =
                "";

        };


    reader.readAsText(file);

}


/* =========================================================
   SAVE BUDGET
========================================================= */

function saveBudget() {

    const value =
        Number(
            document.getElementById(
                "monthlyBudget"
            ).value
        );


    if (value < 0) {

        showToast(
            "الميزانية غير صحيحة",
            "⚠️"
        );

        return;

    }


    data.budget = value;


    saveData();

    renderBudget();

    showToast(
        "تم حفظ الميزانية"
    );

}


/* =========================================================
   CLEAR ALL DATA
========================================================= */

function clearAllData() {

    const first =
        confirm(
            "⚠️ سيتم حذف جميع بياناتك. هل أنت متأكد؟"
        );


    if (!first) return;


    const second =
        confirm(
            "تأكيد أخير: لا يمكن التراجع عن هذه العملية."
        );


    if (!second) return;


    localStorage.removeItem(
        STORAGE_KEY
    );


    data =
        JSON.parse(
            JSON.stringify(defaultData)
        );


    saveData();

    renderAll();

    showToast(
        "تم حذف جميع البيانات",
        "🗑️"
    );

}


/* =========================================================
   MODAL HELPERS
========================================================= */

function openModal(id) {

    const modal =
        document.getElementById(id);


    if (modal) {

        modal.classList.add(
            "show"
        );

    }

}


function closeModal(id) {

    const modal =
        document.getElementById(id);


    if (modal) {

        modal.classList.remove(
            "show"
        );

    }

}


/* =========================================================
   SET DEFAULT DATES
========================================================= */

function setDefaultDates() {

    const transactionDate =
        document.getElementById(
            "transactionDate"
        );


    const debtDate =
        document.getElementById(
            "debtDate"
        );


    if (transactionDate) {

        transactionDate.value =
            today();

    }


    if (debtDate) {

        debtDate.value =
            today();

    }

}


/* =========================================================
   BALANCE PRIVACY
========================================================= */

let balanceHidden = false;


function toggleBalance() {

    balanceHidden =
        !balanceHidden;


    const balance =
        document.getElementById(
            "totalBalance"
        );


    if (balanceHidden) {

        balance.textContent =
            "••••";

    } else {

        balance.textContent =
            money(
                calculateTotalBalance()
            );

    }

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer;


function showToast(
    message,
    icon = "✓"
) {

    const toast =
        document.getElementById(
            "toast"
        );


    document.getElementById(
        "toastMessage"
    ).textContent =
        message;


    document.getElementById(
        "toastIcon"
    ).textContent =
        icon;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            () => {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (value === null || value === undefined)
        return "";

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


/* =========================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
========================================================= */

document.addEventListener(
    "click",
    function(event) {

        if (
            event.target.classList.contains(
                "modal-overlay"
            )
        ) {

            event.target.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   ESC KEY
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (event.key === "Escape") {

            document
                .querySelectorAll(
                    ".modal-overlay.show"
                )
                .forEach(modal => {

                    modal.classList.remove(
                        "show"
                    );

                });

        }

    }
);


/* =========================================================
   INITIAL DATA SAVE
========================================================= */

saveData();