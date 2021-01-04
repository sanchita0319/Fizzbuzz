module.exports = {
    //This functions calculates the correct next response - fizz, buzz, or number
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
}