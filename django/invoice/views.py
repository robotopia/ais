from django.shortcuts import render
from django.shortcuts import get_object_or_404

from . import models

# Create your views here.

def printable_invoice(request, pk):

    invoice = get_object_or_404(models.Invoice, pk=pk)

    context = {
        'invoice': invoice,
    }

    return render(request, 'invoice/printable_invoice.html', context)
