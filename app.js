document.addEventListener('DOMContentLoaded', function() {
    const itemForm = document.getElementById('itemForm');
    const itemsList = document.getElementById('itemsList');
    const searchInput = document.getElementById('searchInput');
    
    // Referencia a la colección 'actividad6' en Firebase
    const actividad6Ref = database.ref('actividad6');
    
    // Escuchar el evento submit del formulario
    itemForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Obtener valores del formulario
        const nombre = document.getElementById('nombre').value.trim();
        const descripcion = document.getElementById('descripcion').value.trim();
        const precio = parseFloat(document.getElementById('precio').value);
        
        // Validación básica
        if (!nombre || !descripcion || isNaN(precio)) {
            alert('Por favor complete todos los campos correctamente');
            return;
        }
        
        // Crear un nuevo item
        const newItem = {
            nombre: nombre,
            descripcion: descripcion,
            precio: precio,
            fecha: firebase.database.ServerValue.TIMESTAMP
        };
        
        // Mostrar loader
        const submitBtn = itemForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
        submitBtn.disabled = true;
        
        // Guardar en Firebase
        actividad6Ref.push(newItem)
            .then(() => {
                // Limpiar el formulario después de guardar
                itemForm.reset();
                // Mostrar notificación de éxito
                showNotification('Producto guardado correctamente', 'success');
            })
            .catch(error => {
                console.error('Error al guardar:', error);
                showNotification('Error al guardar el producto', 'error');
            })
            .finally(() => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
    });
    
    // Función para mostrar notificaciones
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            ${message}
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Función para renderizar los productos
    function renderProducts(items, searchTerm = '') {
        itemsList.innerHTML = '';
        
        if (!items || Object.keys(items).length === 0) {
            itemsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-box-open"></i>
                    <p>No hay productos registrados</p>
                </div>
            `;
            return;
        }
        
        // Convertir objeto a array y filtrar si hay término de búsqueda
        const itemsArray = Object.entries(items)
            .map(([key, value]) => ({ id: key, ...value }))
            .filter(item => {
                if (!searchTerm) return true;
                return (
                    item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    item.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
                );
            });
        
        if (itemsArray.length === 0) {
            itemsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No se encontraron productos</p>
                </div>
            `;
            return;
        }
        
        // Ordenar por fecha (más recientes primero)
        itemsArray.sort((a, b) => b.fecha - a.fecha);
        
        // Renderizar cada producto
        itemsArray.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'item-card';
            itemElement.innerHTML = `
                <h3>${item.nombre}</h3>
                <p>${item.descripcion}</p>
                <p class="item-price">$${item.precio.toFixed(2)}</p>
                <small class="item-date">${formatDate(item.fecha)}</small>
                <button onclick="deleteItem('${item.id}')" class="btn delete-btn">
                    <i class="fas fa-trash"></i> Eliminar
                </button>
            `;
            itemsList.appendChild(itemElement);
        });
    }
    
    // Función para formatear fecha
    function formatDate(timestamp) {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Escuchar cambios en la base de datos
    actividad6Ref.on('value', function(snapshot) {
        const items = snapshot.val();
        renderProducts(items);
    });
    
    // Escuchar búsqueda
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim();
        actividad6Ref.once('value', function(snapshot) {
            const items = snapshot.val();
            renderProducts(items, searchTerm);
        });
    });
});

// Función para eliminar un item
function deleteItem(itemKey) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
        const itemRef = database.ref('actividad6/' + itemKey);
        
        // Mostrar loader en el botón de eliminar
        const deleteBtn = document.querySelector(`button[onclick="deleteItem('${itemKey}')"]`);
        if (deleteBtn) {
            const originalBtnText = deleteBtn.innerHTML;
            deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando...';
            deleteBtn.disabled = true;
        }
        
        itemRef.remove()
            .then(() => {
                // Mostrar notificación de éxito
                const notification = document.createElement('div');
                notification.className = 'notification success';
                notification.innerHTML = `
                    <i class="fas fa-check-circle"></i>
                    Producto eliminado correctamente
                `;
                document.body.appendChild(notification);
                
                setTimeout(() => {
                    notification.classList.add('show');
                }, 10);
                
                setTimeout(() => {
                    notification.classList.remove('show');
                    setTimeout(() => {
                        notification.remove();
                    }, 300);
                }, 3000);
            })
            .catch(error => {
                console.error('Error al eliminar:', error);
                alert('Error al eliminar el producto');
            });
    }
}