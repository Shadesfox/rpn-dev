\c rpn
CREATE TABLE rpn_cbox (
       character_id SERIAL PRIMARY KEY,
       character_name varchar(126),
       image_url text,
       character_bio text,
       character_header text,
       style_sheet_url text,
       owner integer,
       constraint fk_owner_user_id
       		  foreign key (owner)
		  references rpn_users (user_id)
);
