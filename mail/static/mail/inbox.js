document.addEventListener('DOMContentLoaded', function ()
{

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => { compose_email('none') });

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(email)
{

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#email-content').style.display = 'none';

  // Clear out composition fields
  if (email == 'none')
  {
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
  }
  else
  {
    document.querySelector('#compose-recipients').value = email.sender;
    if (email.subject.indexOf('RE:') > -1)
    {
      document.querySelector('#compose-subject').value = `${email.subject}`;
    }
    else
    {
      document.querySelector('#compose-subject').value = `RE: ${email.subject}`;
    }

    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;

  }

  document.querySelector('form').onsubmit = function ()
  {
    recipt = document.querySelector('#compose-recipients').value
    subject = document.querySelector('#compose-subject').value
    body = document.querySelector('#compose-body').value

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipt,
        subject: subject,
        body: body
      })
    })
      .then(response => response.json())
      .then(result =>
      {
        // Print result
        console.log(result);

        load_mailbox('inbox')

      });

    return false
  }


}

function load_mailbox(mailbox)
{

  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'none';


  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails =>
    {
      // Print emails
      console.log(emails);
      if (emails == Object.keys(emails).length)
      {
        var new_item = document.createElement('div');
        new_item.innerHTML = `No ${mailbox} emails.`;
        document.querySelector('#emails-view').appendChild(new_item);
      }

      emails.forEach(mail =>
      {
        const email_box = document.createElement('div');
        email_box.id = 'email_box';
        document.querySelector('#emails-view').append(email_box);


        const email_content = document.createElement('div');
        if (mail.read == false)
        {
          email_content.className = 'email_read';
        }
        else
        {
          email_content.className = 'email';
        }
        email_content.innerHTML = `${mail.sender}: `;

        const subject = document.createElement('b');
        subject.innerHTML = `${mail.subject}`;
        email_content.append(subject);

        email_box.append(email_content);



        const email_date = document.createElement('div');
        email_date.className = 'email_date';
        email_date.innerHTML = `${mail.timestamp}`;

        email_content.append(email_date);


        email_content.addEventListener('click', () =>
        {

          if (mail.read == true)
          {
            fetch(`/emails/${mail.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                read: false
              })
            })
          }

          load_email(mail);

        })

        var isarchived = mail.archived;

        // Archive button
        const archive_bnt = document.createElement('button');

        if (isarchived == false)
        {
          archive_bnt.innerHTML = 'Archive';
          isarchived = true;
        }
        else
        {
          archive_bnt.innerHTML = 'Unarchive';
          isarchived = false;
        }

        console.log(isarchived);

        archive_bnt.className = 'btn btn-primary email-bnt';
        archive_bnt.id = 'archive-bnt';

        archive_bnt.addEventListener('click', () =>
        {
          fetch(`/emails/${mail.id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: isarchived
            })
          }).then(() =>
          {
            load_mailbox('inbox');
          })
        })

        email_box.append(archive_bnt)

        // Unread button
        if (mail.read == false)
        {
          const unread_bnt = document.createElement('button');
          unread_bnt.innerHTML = 'Unread';
          unread_bnt.className = 'btn btn-primary email-bnt'
          unread_bnt.id = 'unread-bnt'

          email_box.append(unread_bnt)

          unread_bnt.addEventListener('click', () =>
          {
            fetch(`/emails/${mail.id}`, {
              method: 'PUT',
              body: JSON.stringify({
                read: true
              })
            }).then(() =>
            {
              load_mailbox('inbox');
            })


          })

        }


      });
    });


  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}


function load_email(mail)
{
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-content').style.display = 'block';

  document.querySelector('#head__recipients').innerHTML = `TO: ${mail.recipients}`;
  document.querySelector('#head__sender').innerHTML = `FROM: ${mail.sender}`;
  document.querySelector('#head__timestamp').innerHTML = `<i>${mail.timestamp}<i/>`;
  document.querySelector('#subject').innerHTML = `${mail.subject}`;

  document.querySelector('.email-content__body').innerHTML = `${mail.body}`;


  document.querySelector('#reply').addEventListener('click', () => { compose_email(mail) })

}