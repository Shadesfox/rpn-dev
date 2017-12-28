\c rpn
CREATE TABLE rpn_users (
       user_id SERIAL PRIMARY KEY,
       user_name varchar(126) UNIQUE,
       passwd_hash bytea
);
