/* =========================================================
   MohaBank
   Personal Finance Manager
   No Server - No Database
   ========================================================= */

const STORAGE_KEY = "mohabank_data_v1";

let data = {
    transactions: [],
    debts: [],
    settings: {
        currency: "JOD",
        darkMode: false
    }
};

let currentDebtTab = "all";


/* =========================================================
   INITIALIZATION
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadData();

    initializeDateInputs();

    applyTheme();

    document.getElementById("transactionForm")
        .addEventListener("submit", saveTransaction);

    document.getElementById("debtForm")
        .addEventListener("submit", saveDebt);

    renderAll();

    registerServiceWorker();
});


/* =========================================================
   STORAGE
   ========================================================= */

function loadData() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {

            const parsed = JSON.parse(saved);

            data = {
                transactions: Array.isArray(parsed.transactions)
                    ? parsed.transactions
                    : [],

                debts: Array.isArray(parsed.debts)
                    ? parsed.debts
                    : [],

                settings: {
                    currency: parsed.settings?.currency || "JOD",
                    darkMode: parsed.settings?.darkMode || false
                }
            };
        }

    } catch (error) {

        console.error("Loading error:", error);

        showToast("تعذر تحميل البيانات");
    }
}


function saveData() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(data)
    );
}


/* =========================================================
   CURRENCY
   ========================================================= */

function getCurrencySymbol() {

    const symbols = {
        JOD: "د.أ",
        USD: "$",
        SAR: "ر.س",
        AED: "د.إ"
    };

    return symbols[data.settings.currency] || "د.أ";
}


function formatMoney(amount) {

    const number = Number(amount) || 0;

    return `${number.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })} ${getCurrencySymbol()}`;
}


/* =========================================================
   DATE
   ========================================================= */

function today() {

    const d = new Date();

    const year = d.getFullYear();

    const month = String(d.getMonth() + 1).padStart(2, "0");

    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


function initializeDateInputs() {

    document.getElementById("transactionDate").value = today();

    document.getElementById("debtDate").value = today();
}


function formatDate(dateString) {

    if (!dateString) {
        return "-";
    }

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("ar-JO", {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function showPage(pageId, button = null) {

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    const page = document.getElementById(pageId);

    if (page) {
        page.classList.add("active");
    }

    document.querySelectorAll(".nav-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    if (button) {

        button.classList.add("active");

    } else {

        const matchingButton =
            [...document.querySelectorAll(".nav-btn")]
                .find(btn => btn.getAttribute("onclick")?.includes(`'${pageId}'`));

        if (matchingButton) {
            matchingButton.classList.add("active");
        }
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

    renderAll();
}


/* =========================================================
   TRANSACTION MODAL
   ========================================================= */

function openTransactionModal(type = "income", id = null) {

    const modal = document.getElementById("transactionModal");

    const form = document.getElementById("transactionForm");

    form.reset();

    document.getElementById("transactionDate").value = today();

    document.getElementById("transactionId").value = "";

    document.getElementById("transactionModalTitle").textContent =
        id ? "تعديل العملية" : "إضافة عملية";

    selectTransactionType(type);

    if (id) {

        const transaction =
            data.transactions.find(item => item.id === id);

        if (!transaction) {
            return;
        }

        document.getElementById("transactionId").value =
            transaction.id;

        document.getElementById("transactionAmount").value =
            transaction.amount;

        document.getElementById("transactionTitle").value =
            transaction.title;

        document.getElementById("transactionCategory").value =
            transaction.category;

        document.getElementById("transactionDate").value =
            transaction.date;

        document.getElementById("transactionNote").value =
            transaction.note || "";

        selectTransactionType(transaction.type);
    }

    modal.classList.add("show");
}


function selectTransactionType(type) {

    document.getElementById("transactionType").value = type;

    const incomeBtn =
        document.getElementById("incomeTypeBtn");

    const expenseBtn =
        document.getElementById("expenseTypeBtn");

    incomeBtn.classList.remove(
        "active-income",
        "active-expense"
    );

    expenseBtn.classList.remove(
        "active-income",
        "active-expense"
    );

    if (type === "income") {

        incomeBtn.classList.add("active-income");

    } else {

        expenseBtn.classList.add("active-expense");
    }
}


function closeModal(id) {

    document.getElementById(id).classList.remove("show");
}


/* =========================================================
   SAVE TRANSACTION
   ========================================================= */

function saveTransaction(event) {

    event.preventDefault();

    const id =
        document.getElementById("transactionId").value;

    const transaction = {

        id: id || generateId(),

        type:
            document.getElementById("transactionType").value,

        amount:
            Number(document.getElementById("transactionAmount").value),

        title:
            document.getElementById("transactionTitle").value.trim(),

        category:
            document.getElementById("transactionCategory").value,

        date:
            document.getElementById("transactionDate").value,

        note:
            document.getElementById("transactionNote").value.trim(),

        createdAt:
            new Date().toISOString()
    };


    if (!transaction.amount || transaction.amount <= 0) {

        showToast("أدخل مبلغًا صحيحًا");

        return;
    }


    if (!transaction.title) {

        showToast("أدخل وصف العملية");

        return;
    }


    if (id) {

        const index =
            data.transactions.findIndex(item => item.id === id);

        if (index !== -1) {

            data.transactions[index] = transaction;
        }

    } else {

        data.transactions.push(transaction);
    }


    saveData();

    closeModal("transactionModal");

    renderAll();

    showToast(
        id
            ? "تم تعديل العملية"
            : "تمت إضافة العملية"
    );
}


/* =========================================================
   TRANSACTIONS RENDER
   ========================================================= */

function renderTransactions() {

    const container =
        document.getElementById("transactionsList");

    if (!container) {
        return;
    }

    const search =
        document.getElementById("transactionSearch")
            ?.value
            .trim()
            .toLowerCase() || "";

    const filter =
        document.getElementById("transactionFilter")
            ?.value || "all";


    let transactions =
        [...data.transactions];


    if (filter !== "all") {

        transactions =
            transactions.filter(
                item => item.type === filter
            );
    }


    if (search) {

        transactions =
            transactions.filter(item => {

                const text = `
                    ${item.title}
                    ${item.category}
                    ${item.note || ""}
                `.toLowerCase();

                return text.includes(search);
            });
    }


    transactions.sort(
        (a, b) => b.date.localeCompare(a.date)
    );


    if (!transactions.length) {

        container.innerHTML =
            `<div class="empty">لا توجد عمليات.</div>`;

        return;
    }


    container.innerHTML =
        transactions.map(createTransactionHTML).join("");
}


function createTransactionHTML(transaction) {

    const isIncome =
        transaction.type === "income";

    const sign =
        isIncome ? "+" : "-";

    const icon =
        isIncome ? "📥" : "📤";

    return `

        <div class="transaction-item">

            <div class="item-info">

                <div class="item-title">
                    ${icon}
                    ${escapeHTML(transaction.title)}
                </div>

                <div class="item-meta">
                    ${escapeHTML(transaction.category)}
                    •
                    ${formatDate(transaction.date)}
                </div>

                ${
                    transaction.note
                        ? `
                        <div class="item-meta">
                            ${escapeHTML(transaction.note)}
                        </div>
                        `
                        : ""
                }

                <div class="item-actions">

                    <button
                        class="small-btn"
                        onclick="openTransactionModal(
                            '${transaction.type}',
                            '${transaction.id}'
                        )">
                        ✏️ تعديل
                    </button>

                    <button
                        class="small-btn delete-btn"
                        onclick="deleteTransaction('${transaction.id}')">
                        🗑 حذف
                    </button>

                </div>

            </div>

            <div class="amount ${transaction.type}">
                ${sign}${formatMoney(transaction.amount)}
            </div>

        </div>
    `;
}


/* =========================================================
   DELETE TRANSACTION
   ========================================================= */

function deleteTransaction(id) {

    const transaction =
        data.transactions.find(item => item.id === id);

    if (!transaction) {
        return;
    }


    const confirmed =
        confirm(
            `هل تريد حذف العملية "${transaction.title}"؟`
        );


    if (!confirmed) {
        return;
    }


    data.transactions =
        data.transactions.filter(
            item => item.id !== id
        );


    saveData();

    renderAll();

    showToast("تم حذف العملية");
}


/* =========================================================
   DEBT MODAL
   ========================================================= */

function openDebtModal(type = "owedToMe", id = null) {

    const modal =
        document.getElementById("debtModal");

    document.getElementById("debtForm").reset();

    document.getElementById("debtDate").value = today();

    document.getElementById("debtId").value = "";

    document.getElementById("debtModalTitle").textContent =
        id ? "تعديل الدين" : "إضافة دين";


    selectDebtType(type);


    if (id) {

        const debt =
            data.debts.find(item => item.id === id);

        if (!debt) {
            return;
        }


        document.getElementById("debtId").value =
            debt.id;

        document.getElementById("debtPerson").value =
            debt.person;

        document.getElementById("debtAmount").value =
            debt.amount;

        document.getElementById("debtDate").value =
            debt.date;

        document.getElementById("debtDueDate").value =
            debt.dueDate || "";

        document.getElementById("debtNote").value =
            debt.note || "";

        selectDebtType(debt.type);
    }


    modal.classList.add("show");
}


function selectDebtType(type) {

    document.getElementById("debtType").value = type;

    const owedBtn =
        document.getElementById("owedToMeBtn");

    const oweBtn =
        document.getElementById("iOweBtn");


    owedBtn.classList.remove(
        "active-income",
        "active-expense"
    );

    oweBtn.classList.remove(
        "active-income",
        "active-expense"
    );


    if (type === "owedToMe") {

        owedBtn.classList.add("active-income");

    } else {

        oweBtn.classList.add("active-expense");
    }
}


/* =========================================================
   SAVE DEBT
   ========================================================= */

function saveDebt(event) {

    event.preventDefault();

    const id =
        document.getElementById("debtId").value;


    const debt = {

        id: id || generateId(),

        type:
            document.getElementById("debtType").value,

        person:
            document.getElementById("debtPerson").value.trim(),

        amount:
            Number(document.getElementById("debtAmount").value),

        date:
            document.getElementById("debtDate").value,

        dueDate:
            document.getElementById("debtDueDate").value,

        note:
            document.getElementById("debtNote").value.trim(),

        createdAt:
            new Date().toISOString()
    };


    if (!debt.person) {

        showToast("أدخل اسم الشخص");

        return;
    }


    if (!debt.amount || debt.amount <= 0) {

        showToast("أدخل مبلغًا صحيحًا");

        return;
    }


    if (id) {

        const index =
            data.debts.findIndex(item => item.id === id);

        if (index !== -1) {

            data.debts[index] = debt;
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
   DEBTS RENDER
   ========================================================= */

function renderDebts() {

    const container =
        document.getElementById("debtsList");

    if (!container) {
        return;
    }


    let debts =
        [...data.debts];


    if (currentDebtTab !== "all") {

        debts =
            debts.filter(
                debt => debt.type === currentDebtTab
            );
    }


    debts.sort(
        (a, b) => b.date.localeCompare(a.date)
    );


    if (!debts.length) {

        container.innerHTML =
            `<div class="empty">لا توجد ديون.</div>`;

        return;
    }


    container.innerHTML =
        debts.map(createDebtHTML).join("");
}


function createDebtHTML(debt) {

    const isOwedToMe =
        debt.type === "owedToMe";

    const icon =
        isOwedToMe ? "👤" : "💳";

    const label =
        isOwedToMe
            ? "لك عنده"
            : "عليك له";


    let overdue = false;

    if (debt.dueDate) {

        overdue =
            debt.dueDate < today();
    }


    return `

        <div class="debt-item">

            <div class="item-info">

                <div class="item-title">
                    ${icon}
                    ${escapeHTML(debt.person)}
                </div>

                <div class="item-meta">
                    ${label}
                    •
                    ${formatDate(debt.date)}
                </div>

                ${
                    debt.dueDate
                        ? `
                        <div class="item-meta ${
                            overdue ? "overdue" : ""
                        }">
                            الاستحقاق:
                            ${formatDate(debt.dueDate)}
                            ${overdue ? " • متأخر" : ""}
                        </div>
                        `
                        : ""
                }

                ${
                    debt.note
                        ? `
                        <div class="item-meta">
                            ${escapeHTML(debt.note)}
                        </div>
                        `
                        : ""
                }

                <div class="item-actions">

                    <button
                        class="small-btn"
                        onclick="openDebtModal(
                            '${debt.type}',
                            '${debt.id}'
                        )">
                        ✏️ تعديل
                    </button>

                    <button
                        class="small-btn"
                        onclick="markDebtPaid('${debt.id}')">
                        ✅ تم السداد
                    </button>

                    <button
                        class="small-btn delete-btn"
                        onclick="deleteDebt('${debt.id}')">
                        🗑 حذف
                    </button>

                </div>

            </div>

            <div class="amount debt">
                ${formatMoney(debt.amount)}
            </div>

        </div>
    `;
}


/* =========================================================
   DEBT TABS
   ========================================================= */

function setDebtTab(tab, button) {

    currentDebtTab = tab;

    document.querySelectorAll(".debt-tabs button")
        .forEach(btn => btn.classList.remove("active"));

    button.classList.add("active");

    renderDebts();
}


/* =========================================================
   DELETE DEBT
   ========================================================= */

function deleteDebt(id) {

    const debt =
        data.debts.find(item => item.id === id);

    if (!debt) {
        return;
    }


    if (!confirm(`حذف دين ${debt.person}؟`)) {
        return;
    }


    data.debts =
        data.debts.filter(
            item => item.id !== id
        );


    saveData();

    renderAll();

    showToast("تم حذف الدين");
}


/* =========================================================
   MARK DEBT PAID
   ========================================================= */

function markDebtPaid(id) {

    const debt =
        data.debts.find(item => item.id === id);

    if (!debt) {
        return;
    }


    if (
        !confirm(
            `هل تم سداد الدين مع ${debt.person}؟`
        )
    ) {
        return;
    }


    data.debts =
        data.debts.filter(
            item => item.id !== id
        );


    /*
       تسجيل حركة مالية تلقائيًا:

       إذا كان الشخص مدينًا لك:
       استلام المال = دخل

       إذا كنت مدينًا للشخص:
       دفع المال = مصروف
    */

    data.transactions.push({

        id: generateId(),

        type:
            debt.type === "owedToMe"
                ? "income"
                : "expense",

        amount:
            debt.amount,

        title:
            debt.type === "owedToMe"
                ? `تحصيل دين من ${debt.person}`
                : `سداد دين لـ ${debt.person}`,

        category: "ديون",

        date: today(),

        note:
            "تم تسجيل العملية تلقائيًا عند سداد الدين",

        createdAt:
            new Date().toISOString()
    });


    saveData();

    renderAll();

    showToast("تم تسجيل السداد");
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function renderDashboard() {

    const income =
        data.transactions
            .filter(item => item.type === "income")
            .reduce(
                (sum, item) => sum + Number(item.amount),
                0
            );


    const expense =
        data.transactions
            .filter(item => item.type === "expense")
            .reduce(
                (sum, item) => sum + Number(item.amount),
                0
            );


    const balance =
        income - expense;


    const owedToMe =
        data.debts
            .filter(item => item.type === "owedToMe")
            .reduce(
                (sum, item) => sum + Number(item.amount),
                0
            );


    const iOwe =
        data.debts
            .filter(item => item.type === "iOwe")
            .reduce(
                (sum, item) => sum + Number(item.amount),
                0
            );


    document.getElementById("currentBalance").textContent =
        formatMoney(balance);

    document.getElementById("totalIncome").textContent =
        formatMoney(income);

    document.getElementById("totalExpense").textContent =
        formatMoney(expense);

    document.getElementById("owedToMeTotal").textContent =
        formatMoney(owedToMe);

    document.getElementById("iOweTotal").textContent =
        formatMoney(iOwe);


    const recent =
        [...data.transactions]
            .sort(
                (a, b) => b.date.localeCompare(a.date)
            )
            .slice(0, 5);


    const container =
        document.getElementById("recentTransactions");


    if (!recent.length) {

        container.innerHTML =
            `<div class="empty">لا توجد عمليات حتى الآن.</div>`;

    } else {

        container.innerHTML =
            recent.map(createTransactionHTML).join("");
    }
}


/* =========================================================
   STATISTICS
   ========================================================= */

function renderStatistics() {

    const transactions =
        data.transactions;


    const expenses =
        transactions.filter(
            item => item.type === "expense"
        );


    const totalIncome =
        transactions
            .filter(item => item.type === "income")
            .reduce(
                (sum, item) => sum + Number(item.amount),
                0
            );


    const totalExpense =
        expenses.reduce(
            (sum, item) => sum + Number(item.amount),
            0
        );


    const averageExpense =
        expenses.length
            ? totalExpense / expenses.length
            : 0;


    const largestExpense =
        expenses.length
            ? Math.max(
                ...expenses.map(
                    item => Number(item.amount)
                )
            )
            : 0;


    document.getElementById("statTransactions")
        .textContent = transactions.length;


    document.getElementById("statAverageExpense")
        .textContent = formatMoney(averageExpense);


    document.getElementById("statLargestExpense")
        .textContent = formatMoney(largestExpense);


    document.getElementById("statNet")
        .textContent =
            formatMoney(totalIncome - totalExpense);


    renderCategoryStats(expenses);

    renderMonthlyStats(expenses);
}


function renderCategoryStats(expenses) {

    const container =
        document.getElementById("categoryStats");


    const categories = {};


    expenses.forEach(item => {

        categories[item.category] =
            (categories[item.category] || 0)
            + Number(item.amount);
    });


    const entries =
        Object.entries(categories)
            .sort((a, b) => b[1] - a[1]);


    if (!entries.length) {

        container.innerHTML =
            `<div class="empty">لا توجد مصروفات.</div>`;

        return;
    }


    const max =
        Math.max(...entries.map(item => item[1]));


    container.innerHTML =
        entries.map(([category, amount]) => {

            const percentage =
                max
                    ? (amount / max) * 100
                    : 0;


            return `

                <div class="stat-row">

                    <div class="stat-row-head">

                        <span>
                            ${escapeHTML(category)}
                        </span>

                        <strong>
                            ${formatMoney(amount)}
                        </strong>

                    </div>

                    <div class="progress">
                        <div
                            class="progress-bar"
                            style="width:${percentage}%">
                        </div>
                    </div>

                </div>
            `;

        }).join("");
}


function renderMonthlyStats(expenses) {

    const container =
        document.getElementById("monthlyStats");


    const months = {};


    expenses.forEach(item => {

        const month =
            item.date.slice(0, 7);

        months[month] =
            (months[month] || 0)
            + Number(item.amount);
    });


    const entries =
        Object.entries(months)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 12);


    if (!entries.length) {

        container.innerHTML =
            `<div class="empty">لا توجد بيانات.</div>`;

        return;
    }


    const max =
        Math.max(...entries.map(item => item[1]));


    container.innerHTML =
        entries.map(([month, amount]) => {

            const percentage =
                max
                    ? (amount / max) * 100
                    : 0;


            return `

                <div class="stat-row">

                    <div class="stat-row-head">

                        <span>
                            ${formatMonth(month)}
                        </span>

                        <strong>
                            ${formatMoney(amount)}
                        </strong>

                    </div>

                    <div class="progress">
                        <div
                            class="progress-bar"
                            style="width:${percentage}%">
                        </div>
                    </div>

                </div>
            `;

        }).join("");
}


function formatMonth(value) {

    const date =
        new Date(value + "-01T00:00:00");

    return date.toLocaleDateString("ar-JO", {
        year: "numeric",
        month: "long"
    });
}


/* =========================================================
   DEBT SUMMARY
   ========================================================= */

function renderDebtSummary() {

    const owedToMe =
        data.debts
            .filter(item => item.type === "owedToMe")
            .reduce(
                (sum, item) => sum + Number(item.amount),
                0
            );


    const iOwe =
        data.debts
            .filter(item => item.type === "iOwe")
            .reduce(
                (sum, item) => sum + Number(item.amount),
                0
            );


    document.getElementById("debtsPageOwedToMe")
        .textContent = formatMoney(owedToMe);


    document.getElementById("debtsPageIOwe")
        .textContent = formatMoney(iOwe);
}


/* =========================================================
   SETTINGS
   ========================================================= */

function renderSettings() {

    const select =
        document.getElementById("currencySelect");

    if (select) {

        select.value =
            data.settings.currency;
    }
}


function changeCurrency() {

    data.settings.currency =
        document.getElementById("currencySelect").value;

    saveData();

    renderAll();

    showToast("تم تغيير العملة");
}


/* =========================================================
   THEME
   ========================================================= */

function applyTheme() {

    document.body.classList.toggle(
        "dark",
        data.settings.darkMode
    );


    document.getElementById("themeBtn").textContent =
        data.settings.darkMode
            ? "☀️"
            : "🌙";
}


document.getElementById("themeBtn")
    .addEventListener("click", () => {

        data.settings.darkMode =
            !data.settings.darkMode;

        saveData();

        applyTheme();
    });


/* =========================================================
   EXPORT
   ========================================================= */

function exportData() {

    const backup = {

        app: "MohaBank",

        version: "1.0.0",

        exportedAt:
            new Date().toISOString(),

        data: data
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
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const a =
        document.createElement("a");


    const date =
        today();


    a.href = url;

    a.download =
        `MohaBank-Backup-${date}.json`;

    a.click();


    URL.revokeObjectURL(url);

    showToast("تم تصدير النسخة الاحتياطية");
}


/* =========================================================
   IMPORT
   ========================================================= */

function importData(event) {

    const file =
        event.target.files[0];


    if (!file) {
        return;
    }


    const reader =
        new FileReader();


    reader.onload = function(e) {

        try {

            const backup =
                JSON.parse(e.target.result);


            let imported;


            if (backup.data) {

                imported = backup.data;

            } else {

                imported = backup;
            }


            if (
                !Array.isArray(imported.transactions) ||
                !Array.isArray(imported.debts)
            ) {

                throw new Error(
                    "Invalid backup"
                );
            }


            if (
                !confirm(
                    "استيراد النسخة سيستبدل البيانات الحالية. هل تريد المتابعة؟"
                )
            ) {
                return;
            }


            data = {

                transactions:
                    imported.transactions,

                debts:
                    imported.debts,

                settings: {

                    currency:
                        imported.settings?.currency || "JOD",

                    darkMode:
                        imported.settings?.darkMode || false
                }
            };


            saveData();

            applyTheme();

            renderAll();

            showToast("تم استيراد البيانات بنجاح");


        } catch (error) {

            console.error(error);

            showToast("ملف النسخة الاحتياطية غير صالح");
        }
    };


    reader.readAsText(file);

    event.target.value = "";
}


/* =========================================================
   DELETE EVERYTHING
   ========================================================= */

function deleteAllData() {

    const confirmed =
        confirm(
            "تحذير!\n\nسيتم حذف جميع العمليات والديون نهائيًا.\n\nهل أنت متأكد؟"
        );


    if (!confirmed) {
        return;
    }


    const secondConfirm =
        confirm(
            "تأكيد أخير: هل تريد حذف كل بيانات MohaBank؟"
        );


    if (!secondConfirm) {
        return;
    }


    data = {

        transactions: [],

        debts: [],

        settings: {

            currency: "JOD",

            darkMode:
                data.settings.darkMode
        }
    };


    saveData();

    renderAll();

    showToast("تم حذف جميع البيانات");
}


/* =========================================================
   RENDER ALL
   ========================================================= */

function renderAll() {

    renderDashboard();

    renderTransactions();

    renderDebts();

    renderDebtSummary();

    renderStatistics();

    renderSettings();
}


/* =========================================================
   ID GENERATOR
   ========================================================= */

function generateId() {

    return (
        Date.now().toString(36)
        + "-"
        + Math.random()
            .toString(36)
            .substring(2, 10)
    );
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =========================================================
   TOAST
   ========================================================= */

let toastTimer;


function showToast(message) {

    const toast =
        document.getElementById("toast");


    toast.textContent = message;

    toast.classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(() => {

            toast.classList.remove("show");

        }, 2500);
}


/* =========================================================
   CLOSE MODAL BY CLICKING OUTSIDE
   ========================================================= */

document.querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener("click", event => {

            if (event.target === modal) {

                modal.classList.remove("show");
            }
        });
    });


/* =========================================================
   SERVICE WORKER
   ========================================================= */

function registerServiceWorker() {

    if ("serviceWorker" in navigator) {

        window.addEventListener("load", () => {

            navigator.serviceWorker
                .register("service-worker.js")
                .then(() => {

                    console.log(
                        "MohaBank Service Worker registered"
                    );

                })
                .catch(error => {

                    console.log(
                        "Service Worker error:",
                        error
                    );
                });
        });
    }
}