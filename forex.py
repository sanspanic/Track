from forex_python.converter import CurrencyRates
from forex_python.converter import CurrencyCodes

c = CurrencyRates()
s = CurrencyCodes()

def convert(curr1, curr2, amount): 
    return c.convert(curr1, curr2, amount)

def get_symbol(curr_str): 
    return s.get_symbol(curr_str)

list_of_curr_codes = ['EUR', 'IDR', 'BGN', 'ILS', 'GBP', 'DKK', 'CAD', 'JPY', 'HUF', 'RON', 'MYR', 'SEK', 'SGD', 'HKD', 'AUD', 'CHF', 'KRW', 'CNY', 'TRY', 'HRK', 'NZD', 'THB', 'USD', 'NOK', 'RUB', 'INR', 'MXN', 'CZK', 'BRL', 'PLN', 'PHP', 'ZAR']