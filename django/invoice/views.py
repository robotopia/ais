from django.http import Http404
from django.shortcuts import render
from django.shortcuts import get_object_or_404

from . import models

# Create your views here.

def printable_invoice(request, pk):

    invoice = get_object_or_404(models.Invoice, pk=pk)

    if not request.user.is_superuser:
        if invoice.bill_to not in request.user.client_set.all() or invoice.issued is None:
            raise Http404("Invoice not found")

    context = {
        'invoice': invoice,
    }

    return render(request, 'invoice/printable_invoice.html', context)
