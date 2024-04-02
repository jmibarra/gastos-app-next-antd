import { IExpense } from "../models/expense.model";

const userData = JSON.parse(localStorage.getItem("user") as string);

export const getExpensesByPeriod = async (period: string): Promise<IExpense[]> => {
    const url = "http://localhost:8080/expenses/all/";
    const urlWithPeriod = url + period;

    const response = await fetch(urlWithPeriod, {
        method: "GET",
        headers: {
            Authorization: `${userData?.token}`,
            "Content-Type": "application/json",
        },
    });

    if (response.ok) return response.json().then((data) => data.expenses);
    else return [];
};

export const deleteExpenseById = async (id: string) => {
    const url = `http://localhost:8080/expenses/${id}`;

    const response = await fetch(url, {
        method: "DELETE",
        headers: {
            Authorization: `${userData?.token}`,
            "Content-Type": "application/json",
        },
    });
}

export const updateExpenseById = async (id: string, expense: IExpense) => {
    const url = `http://localhost:8080/expenses/${id}`;

    console.log(expense)

    const response = await fetch(url, {
        method: "PATCH",
        body: JSON.stringify(expense),
        headers: {
            Authorization: `${userData?.token}`,
            "Content-Type": "application/json",
        },
    });

    return response.json().then((data) => data);
}

export const createExpense = async (expense: IExpense) => {
    const url = "http://localhost:8080/expenses";

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(expense),
        headers: {
            Authorization: `${userData?.token}`,
            "Content-Type": "application/json",
        },
    })

    //Obtengo la respuesta del response y devuelvo el data
    return response.json().then((data) => data);
}