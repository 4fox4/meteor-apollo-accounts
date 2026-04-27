import { Meteor } from "meteor/meteor";
import getConnection from "./getConnection";

export default async function (passedContext, name, ...args) {
  const handler = Meteor.server.method_handlers[name];
  if (!handler) {
    throw new Meteor.Error(404, `Method '${name}' not found`);
  }

  const connection = getConnection();
  const context = {
    connection,
    setUserId(userId) {},
    ...passedContext,
  };

  return await handler.call(context, ...args);
}
