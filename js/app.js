(function() {
    var TABLE = {
        proto : {
            init : function(el) {
                this.element = $(el).find('tbody');
            },
            add: function(arr) {
                var row = $('<tr>').html(function() {
                    return $.map(arr, function(value) {
                        return'<td>'+ value + '</td>';
                    }).join('');
                });
                this.element.append(row);
            },
            load: function(rows, order) {
                for(var i = 0; rows[i]; i++ ) {
                    this.add(rows[i]);
                }
                var fields = [];
                for(var j = 0; order[j]; j++) {
                    fields.push(rows[i][order[j]]);
                }
                this.add(fields);
            },
            clear: function() {
                this.element.empty();
            }
        },
        create : function(el) {
            var table = Object.create(this.proto);
            table.init(el);
            return table;
        } 
    };

    var EMPLOYEE = {
        create : function(firstName, lastName, role) {
            var employee = {
                firstName: firstName,
                lastName: lastName,
                role: role,
                dateEmployed: new Date()
            };
            amplify.publish('employee-created', employee );
            return employee;
        }
    };

    var alerts = {
        display: function(type, message) {
            $('#alert-area').append(
            $('<div class="alert alert-' + type + ' fade in data-alert">'+ message + '</div>'));

            setTimeout(function() {
                $('.alert').fadeOut('slow', function() { this.parentNode.removeChild(this); });
            }, 2000);
        }
    };
    var employeeModal = $('#add-employee-modal').modal({ backdrop: 'static'});
    var employeeTable = TABLE.create($('#employee-table'));
    var employeeStore = amplify.store('employees') || [];
    
    $('#add-employee').click(function() {
        $('#add-employee-modal').modal('show');
    });

    $('.close').click(function() {
        $('#add-employee-modal').modal('hide');
    });

    $('#create-employee').click(function() {
        var form = $('#employee-form');
            employeeModal.modal('hide');
        EMPLOYEE.create(
            form.find('[name=firstName]').val(),
            form.find('[name=lastName]').val(),
            form.find('[name=role]').val()
        );
        form.find('input').val('');
    });

    $('#push-data').click(function() {
        amplify.request('pushData', { employees: amplify.store('employees') }, function(data) {
            amplify.publish('data-pushed', data);
        });
    });

    amplify.request.define('pushData', 'ajax', {
        url: '/employees',
        type: 'POST'
    }); 
    amplify.subscribe('employee-created', function(employee) {
        employeeTable.add([employee.firstName, employee.lastName, employee.role, employee.dateEmployed]);
        alerts.display('success', 'New Employee Added');
    });
    amplify.subscribe('employee-created', function(employee) {
        employeeStore.push(employee);
        amplify.store('employees', employeeStore);
    });
    amplify.subscribe('data-pushed', function() {
        alerts.display('success', 'Data successfully sent to server');
    });
})();