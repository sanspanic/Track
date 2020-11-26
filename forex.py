from forex_python.converter import CurrencyRates
from forex_python.converter import CurrencyCodes

c = CurrencyRates()
s = CurrencyCodes()

def convert(curr1, curr2, amount): 
    return c.convert(curr1, curr2, amount)

def get_symbol(curr_str): 
    return s.get_symbol(curr_str)