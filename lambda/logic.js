module.exports = {
    result(number) {
        if (number % 3  === 0 && number % 5 === 0)
        {
            return "fizzbuzz";
        }
        else if (number % 3 === 0)
        {
            return "fizz";
        }
        else if (number % 5 === 0)
        {
            return "buzz";
        }
        else
        {
            return number;
        }
    },
    //This finds the max given two numbers; used to find the highest number reached
    checkMax(num1, num2) {
        if (!num1) {
            return true;
        }
        else if (num1 === num2) {
            return false;
        }
        else if (num2 > num1) {
            return true;
        }
        else {
            return false;
        }
    }
}
